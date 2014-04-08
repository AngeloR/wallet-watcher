function WalletWatcher(arg_currency, arg_wallet_addr) {
    var self = this;

    self.wallet_addr = undefined;
    self.currency = undefined;

    var CryptoHandlers = {};

    function empty() {
        console.log(arguments);
    }

    var events = {
        balance: empty          // triggered after an event is handled
    };

    var Utils = {
        is_supported_currency: function(currency) {
            currency = currency.toUpperCase();
            return CryptoHandlers[currency] !== undefined;
        } 
    }

    function get_balance() {
        CryptoHandlers[self.currency]();
    }

    function bind_event(event, handler) {
        events[event] = handler;
    }

    function trigger(event, args) {
        if(events[event] !== undefined) {
            events[event](args);
        }
    }

    function set_wallet_type(type) {
        if(Utils.is_supported_currency(type)) {
            self.currency = type.toUpperCase();
        }
        else {
            console.error('[' + type + '] is not a supported crypto currency.');
        }
    }

    function construct(currency, wallet_addr) {
        self.wallet_addr = wallet_addr;
        set_wallet_type(currency)
    }

    function xhr_total_parser(total) {
        var currency = {
            pre: 0,
            post: 00000000
        };
        // the last 8 chars are the decimal points
        if(total.length > 8) {
            var offset = total.length - 8;
            currency.pre = parseInt(total.substr(0, offset));
            currency.post = parseInt(total.substr(offset));
        }
        else {
            currency.post = total;
        }
    
        return currency;
    }


    /** Various Wallet Handlers **/
    CryptoHandlers.BTC = function() {
        $.ajax({
            url: 'https://blockchain.info/q/getreceivedbyaddress/' + self.wallet_addr,
            success: function(total) {
                trigger('balance', xhr_total_parser(total));
            }
        });
    }

    CryptoHandlers.DOGE = function() {
        $.ajax({
            url: 'http://dogechain.info/chain/Dogecoin/q/addressbalance/' + self.wallet_addr,
            success: function(total) {
                trigger('balance', xhr_total_parser(total));
            }
        });
    }

    construct(arg_currency, arg_wallet_addr);

    return {
        get_balance: get_balance,
        on: bind_event
    }
}
