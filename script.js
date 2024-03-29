$(document).ready(function() {
    console.log("Let's get ready to rumble!!");


    // Let's define our languages and their api pairs
    var language_codes = ['nl',    'de',     'it',      'hu',        'ga',    'la',    'lv',      'ms',    'mi',    'pt',         'sm',     'so',     'es',      'sw',      'zu'];
    var language_names = ['Dutch', 'German', 'Italian', 'Hungarian', 'Irish', 'Latin', 'Latvian', 'Malay', 'Maori', 'Portuguese', 'Samoan', 'Somali', 'Spanish', 'Swahili', 'Zulu'];
    var num_active = 0;
    var MAX_ACTIVE = 4;

    // Initialize the code dictionary
    var codeDict = {};
    codeDict['en'] = 'English';
    codeDict['nl'] = 'Dutch';
    codeDict['de'] = 'German';
    codeDict['it'] = 'Italian';
    codeDict['hu'] = 'Hungarian';
    codeDict['ga'] = 'Irish';
    codeDict['la'] = 'Latin';
    codeDict['lv'] = 'Latvian';
    codeDict['ms'] = 'Malay';
    codeDict['mi'] = 'Maori';
    codeDict['pt'] = 'Portuguese';
    codeDict['sm'] = 'Samoan';
    codeDict['so'] = 'Somali';
    codeDict['es'] = 'Spanish';
    codeDict['sw'] = 'Swahili';
    codeDict['zu'] = 'zulu';

    var tags = ["class='link link1'", "class='link link2'", "class='link link3'", "class='link link4'", "class='link link5'", "class='link link6'"]

    var all_codes = ['ar',      'zh',      'nl',    'et',       'fr',     'de',     'it',      'hu',        'ga',    'ja',       'ko',     'la',    'lv',      'ms',    'mi',    'fa',      'pl',     'pt',         'ru',      'sm',     'so',     'sw',      'es',      'th',   'tr',      'uk',        'vi',         'zu'];
    var all_names = ['Arabic',	'Chinese', 'Dutch', 'Estonian', 'French', 'German', 'Italian', 'Hungarian', 'Irish', 'Japanese', 'Korean', 'Latin', 'Latvian', 'Malay', 'Maori', 'Persian', 'Polish', 'Portuguese', 'Russian', 'Samoan', 'Somali', 'Swahili', 'Spanish', 'Thai', 'Turkish', 'Ukrainian', 'Vietnamese', 'Zulu'];

    var results = [];

    function create_select() {
        if (num_active >= MAX_ACTIVE)  {
            // Let them know that things are no bueno
            alert("That's the max number of languages!");
            return;
        };
        // Build a select html item
        var result = "";
        num_active++;

        result += '<div class="field" id="container_';
        result += num_active;
        result += '">'
        result += '<div class="control">';
        result += '<div class="select is-info">'; // Change this to customize the style I guess

        // Building the actual select element with options
        result += '<select id=\'lang_';
        result += num_active;
        result += '\'>';

        for (var i = 0; i < language_codes.length; i++) {
            result += '<option value=\'';
            result += language_codes[i];
            result += '\'>';
            result += language_names[i];
            result += '</option>';
        }

        result += '</select>';

        result += '</div>';
        result += '</div>';
        result += '</div>';

        return result
    };


    function translationFinished(finalOutput, translationResults, chain) {
        // Remove the spinner
        $('#loader').remove();
        // Display the final translated text
        $('#output-text').text(finalOutput);
        $('#output-text').addClass('link');
        $('#output-text').addClass('link1');


        // And build a list of the individual links on the page
        var result = "";
        for (var i = 0; i < translationResults.length - 1; i++) {
            var tag1 = tags[i % tags.length];
            var tag2 = tags[(i + 1) % tags.length];

            // Check for the end color
            if (i + 1 == translationResults.length - 1) {
                tag2 = tags[0]; // Make the last color always match the first
            }

            result += "<div class='chain_link'>";

            // Div for left side
            result += "<div ";
            result += tag1;
            result += ">";
            // Actual text body
            result += "<h4>";
            result += translationResults[i];
            result += "</h4>";
            result += "</div>";

            // Arrow div
            result += "<div><h4 class='arrow'>></h4>";
            // Add in the translation
            result += "<p class='label_small'>"
            result += codeDict[chain[i][0]];
            result += " to ";
            result += codeDict[chain[i][1]];
            result += "</p>";
            // Close the div
            result += "</div>";


            // Div for the right side
            result += "<div ";
            result += tag2;
            result += ">";
            result += "<h4>";
            result += translationResults[i + 1];
            result += "</h4>";
            result += "</div>";

            // Closing the whole div
            result += "</div";
        }

        $("#results-content").append(result);
    };


    function addQuery(url, tag, value) {
        url += tag;
        url += '=';
        url += value;
        return url;
    };

    function doTranslation(lang_chain, curIndex, text) {
        if (!text) return;
        console.log(curIndex);
        var chain_link = lang_chain[curIndex];
        var source = chain_link[0];
        var target = chain_link[1];

        console.log("Translating from: " + source + " to " + target);

        var myurl = 'https://translation.googleapis.com/language/translate/v2?';
        myurl = addQuery(myurl, 'q', text);
        myurl += '&';
        myurl = addQuery(myurl, 'source', source);
        myurl += '&';
        myurl = addQuery(myurl, 'target', target);
        myurl += '&';
        myurl = addQuery(myurl, 'key', $("#api-key").val()); // Ayy, no longer hard-coded

        console.log(myurl);

        $.ajax({
            url : myurl,
            dataType : "json",
            success: function(response) {
                console.log(response);
                translated = response.data.translations[0].translatedText;
                translated.replace("&#39;", '\'');
                results.push(translated);   // Add it to our list
                console.log(translated);    // Log it!

                // Evaluate the current link number, and recurse if not finished
                if (curIndex + 1 < lang_chain.length) {
                    // Trying to add a timeout so it works?
                    setTimeout(function(){
                        doTranslation(lang_chain, curIndex + 1, translated);
                    }, 200);
                }
                else {
                    translationFinished(translated, results, lang_chain);
                }

                // Otherwise, display the output and build the results chain
            },
            error: function(err) {
                console.log(err);
                $('#loader').remove();
                alert("Something went wrong in translation, sorry :(  Please check your API key");
            }
        });
    };

    // Add the first select!
    console.log("Creating the first language selection!");
    addLanguage();


    function build_chain() {
        console.log("Building language chain...");
        var lang_chain = [];
        var prev = 'en';

        // Let's build the translation chain
        for (var i = 0; i < num_active; i++) {
            // Obtain the language code
            var id = 'lang_' + (i + 1);
            var code = $('#' + id).val();

            // Link the previous to the current
            var chain_link = [prev, code];
            lang_chain.push(chain_link);

            // Re-assign previous
            prev = code;
        }

        // Translate back to english at the end
        lang_chain.push([prev, 'en']);

        console.log(lang_chain);
        return lang_chain;
    }

    function addLanguage() {
        $('#languages').append(create_select());
    }

    function removeLanguage() {
        if (num_active > 1) {
            // Find the element and remove
            var id = 'container_' + num_active;
            $('#' + id).remove();

            // Decrement the number of active languages
            num_active--;
        }
    }

    function resetLanguages() {
        while (num_active > 1) {
            removeLanguage(); // Remove them one at a a time until we're finished
        }
        // Reset the initial selector to it's initial value
        $("#lang_1").val(language_codes[0]);
    }


    $("#add-button").click(function(event) {
        console.log("Adding a language!");
        addLanguage();
    });

    $("#del-button").click(function(event) {
        console.log("Removing a language!");
        removeLanguage();
    });


    $("#api-key").keyup(function(event) {
        if (!$("#api-key").val()) {
            $("#api-key").addClass("is-danger");
            return;
        } else {
            $("#api-key").removeClass("is-danger");
        }
    });



    $('#translate-button').click(function(event) {
        if ($('#loader').length) {
            console.log("You can't do that!  Be patient!!");
            return;
        }
        if (!$("#api-key").val()) {
            $("#api-key").addClass("is-danger");
            alert("Please enter an API key");
            return;
        }

        // Obtain the starting text
        var text = $('#start-text').val();

        if (!text) {
            alert("Please enter some input text");
            return;
        }

        lang_chain = build_chain();

        // Clear the results body, if necessary
        $("#results-content").empty();

        results = []; // Reset the results

        console.log('preparing to make API call!');
        
        // Add the loading spinner
        $('#output-container').append('<div id="loader" class="loader"></div>');

        results.push(text);
        doTranslation(lang_chain, 0, text);

    });


    var exampleIndex = 0;

    $('#demo-button').click(function(event) {
        // Clear the results body, if necessary
        $("#results-content").empty();

        // Pull from some of our examples
        exampleIndex++;
        exampleIndex %= examples.length;
        var example = examples[exampleIndex];
        var translations = example.translations;
        var chain = example.chain;

        $("#start-text").val(translations[0]);

        // First build the selectors
        buildSelectors(chain);

        // Then build the translation chain
        translationFinished(translations[translations.length - 1], translations, chain);
    });


    function buildSelectors(languageChain) {        
        // First, clear existing unnecessary selectors
        resetLanguages();

        // Add a language for each member of the chain
        for (var i = 0; i < languageChain.length - 1; i++) {
            if (num_active < (i + 1)) {
                addLanguage();
            }
            // Set the language for visual purposes
            $("#lang_" + (i + 1)).val(languageChain[i][1]);
        }
    }

    var examples = [
        // Example 1
        {
            'translations': [
                "I'm going to buy some milk", 
                "Ich werde etwas Milch kaufen",
                "Voy a comprar un poco de leche",
                "Es gatavojos iegādāties pienu",
                "I'm going to buy milk"
            ],
            'chain': [
                ['en', 'de'],
                ['de', 'es'],
                ['es', 'la'],
                ['la', 'en']
            ]
        },
        // Example 2
        {
            'translations': [
                "That girl sold the mayor's car",
                "Gadis itu menjual kereta Datuk Bandar itu",
                "Gabadha ayaa iibisay gaariga duqa magaalada",
                "La ragazza vende l'auto del sindaco",
                "The girl sells the mayor's car"
            ],
            'chain': [
                ['en', 'ms'],
                ['ms', 'so'],
                ['so', 'it'],
                ['it', 'en']
            ]
        },
        // Example 3
        {
            'translations': [
                "Can I come by tomorrow morning?",
                "An féidir liom teacht ar maidin amárach?",
                "Possum venire cras mane?",
                "E kore e taea e ahau te haere mai apopo te ata?",
                "Je, siwezi kuja kesho asubuhi?",
                "Can not I come tomorrow morning?"
            ],
            'chain': [
                ['en', 'ga'],
                ['ga', 'la'],
                ['la', 'mi'],
                ['mi', 'sw'],
                ['sw', 'en']
            ]
        }
    ];


});
