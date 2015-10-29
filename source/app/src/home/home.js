'use strict';

var React = require('react'),
    Router = require('react-router'),
    Trezor = require('trezor.js'),
    {Link} = Router,
    Home = React.createClass({
        mixins: [Router.Navigation],

        componentWillMount() {
            window.trezorConnect = this.trezorLogged;

            if (window.opener) {
                // try to initiate the handshake, but only if we can reach the opener
                window.opener.postMessage('handshake', '*');
            }
        },

        // window.addEventListener('message', this.onMessage);
        onMessage(event) {
            console.log(event);
        },

        // then replace trezorTest with <a onClick={TrezorConnect.requestLogin.bind(null, '', '', '', 'trezorConnect')}>
        //
        // AND THIS IS FOR DROPBOX SOONISH IMPLEMENTATION
        // Dropbox = require("dropbox"),
        // client = new Dropbox.Client({ key: "PUTKEYHERE!" }),
        //

        trezorLogged(trezorResponse){
            if (trezorResponse.success) {
                window.trezorResponse = trezorResponse;
                sessionStorage.setItem('public_key', window.trezorResponse.public_key);
                this.transitionTo('dashboard');
            }
        },

        trezorTest() {
            window.trezorResponse = {
                'public_key': '0290f42cbf98744c95c2273694a5e9d1673dd68d05a87363f16dacaa1b756439a6',
                'signature': '20133cb72c0847cfc84ee4f7493cd4ea04f39054639651069786646ba9fc25367e5939a7051217208df2c747717d6c6f8acbd9aa800f3871447a8f599441919b51',
                'success': true,
                'version': 2
            };
            sessionStorage.setItem('public_key', window.trezorResponse.public_key);
            this.transitionTo('dashboard');
        },

        render(){
            return (
                <div >
                    <div className='overlay-hill'></div>
                    <div className='overlay-color'></div>
                    <div className='home'>
                        <h1>< img src='dist/img/logo.png'/></h1>
                        <a onClick={TrezorConnect.requestLogin.bind(null, '', '', '', 'trezorConnect')}>
                            <div className='dot'></div>
                            <div className='pulse'></div>
                        </a>
                    </div>
                </div>
            )
        }
    });

module.exports = Home;
