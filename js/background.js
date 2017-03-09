const config = {
    consumerKey: "1iyt7kOztWsYPQBVnF6APm910",
    consumerSecret: "I6SiognJI766oodNrqM3lorIDHg2H09UZeIukvGOC1U7Re6r5m"
};

const cb = new Codebird;
cb.setConsumerKey(config.consumerKey, config.consumerSecret);

chrome.omnibox.onInputEntered.addListener(function(text) {
    if (text !== undefined) {
        post(text);
    }
});

function post(message) {
    chrome.storage.sync.remove("reference", function(){});
    chrome.storage.sync.get(["oauth_token", "oauth_token_secret"], function(values) {
        if (values.oauth_token == null || values.oauth_token_secret == null) {
            auth()
        } else {
            cb.setToken(values.oauth_token, values.oauth_token_secret);
            cb.__call(
                "statuses_update",
                {status: message},
                function (reply, rate, err) {
                    if (err != null) {
                        console.log('an error occurred.\n' + err);
                    } else {
                        console.log('message posted successfully.');
                    }
                }
            );
        }
    });
}

function auth() {
    alert('Twitter認証を行います。');
    cb.__call(
        "oauth_requestToken",
        {oauth_callback: chrome.extension.getURL('templates/oauth_callback.html')},
        function (reply, rate, err) {
            if (err) {
                alert("error response or timeout exceeded");
                console.log("error response or timeout exceeded.\n" + err.error);
            }
            if (reply) {
                chrome.tabs.getSelected(function(tab) {
                    chrome.storage.sync.set({
                        request_token: reply.oauth_token,
                        request_token_secret: reply.oauth_token_secret,
                        reference: tab.url
                    }, function(){});
                });
                cb.setToken(reply.oauth_token, reply.oauth_token_secret);

                cb.__call(
                    "oauth_authorize",
                    {},
                    function (auth_url) {
                        chrome.tabs.create({url:auth_url}, function(tab){})
                    }
                );
            }
        }
    );
}
