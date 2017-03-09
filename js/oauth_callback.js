const config = {
    consumerKey: "1iyt7kOztWsYPQBVnF6APm910",
    consumerSecret: "I6SiognJI766oodNrqM3lorIDHg2H09UZeIukvGOC1U7Re6r5m"
};

$(function() {
    var cb = new Codebird;
    var current_url = window.location.search;
    var hash =  current_url.slice(1).split('&');
    var parameters = {};
    var parameter;

    cb.setConsumerKey(config.consumerKey, config.consumerSecret);

    for (var i = 0; i < hash.length; i++) {
        parameter = hash[i].split("=");
        if (parameter.length === 1) {
            parameter[1] = "";
        }
        parameters[decodeURIComponent(parameter[0])] = decodeURIComponent(parameter[1]);
    }

    if (typeof parameters.oauth_verifier !== "undefined") {
        chrome.storage.sync.get(["request_token", "request_token_secret", "reference"], function(values) {
            cb.setToken(values.request_token, values.request_token_secret);

            cb.__call(
                "oauth_accessToken",
                {oauth_verifier: parameters.oauth_verifier},
                function(reply, rate, err) {
                    if (err) {
                        console.log("authentication error occurred.\n" + err.error);
                    }
                    if (reply) {
                        if (reply.httpStatus == 401) {
                            console.log('unauthorized.');
                        } else {
                            chrome.storage.sync.set({
                                oauth_token: reply.oauth_token,
                                oauth_token_secret: reply.oauth_token_secret
                            }, function(){});
                        }
                        window.location.href = values.reference;
                    }
                }
            );
        });
    }
});
