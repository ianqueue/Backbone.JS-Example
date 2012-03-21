// load the application once the DOM is ready
$(function(){


    // -- Question Collection (History)

    var questionHistory = new(Backbone.Collection.extend({

        model: Question,  // a collection of question Model objects

        initialize: function() {
            this.records = this.localStorage.records;

            this.bind('add', function() {
                console.dir( this.localStorage.findAll() );
                console.log( this.localStorage );
            }, this);
        },

        localStorage: new Store( 'questionHistory' ), // our localStorage object reference

        // grab the current question object or the nth order question in the queue
        getCurrent: function( order ) {
            if ( order ) {
                return this.localStorage.findAll()[ order - 1 ];
            } else {
                var allQuestions = this.localStorage.findAll();
                return ( this.current ) ? this.current : allQuestions[ allQuestions.length - 1 ];
            }
        },

        // get the next order number in the collection history
        nextOrder: function() {
            if (!this.records.length) return 0;
            return this.records.length;
        },

        // get the previous question model to the current question in the collection
        previous: function( question ) {
            this.current = this.localStorage.findAll()[ question.order - 1 ];
            return this.current;
        }

    }));


    // -- Question Model

    var Question = new Backbone.Model.extend({

        // default attributes for a question content item
        defaults: function() {
            return {
                text  : '',
                order : questionHistory.nextOrder()
            };
        }
    });


    // -- Editor View

    var EditorView = new(Backbone.View.extend({

        el: $("#questionEditor"),                   // common practice to tie a Backbone.View to an el (how the widget comes together)

        collection: questionHistory,                // tie in our collection for reference

        //
        template: function(data) {
            return Mustache.render($('#question-template').html(), data);
        },

        //
        events: {
            'click .store-question'    : 'storeQuestion',
            'keyup #editor-input'      : 'showTooltip',
            'click .previous-question' : 'renderPrevious'
        },

        //
        initialize: function() {
            this.input = this.$("#editor-input");

            this.collection.bind('add', this.renderCurrent, this);
        },

        renderCurrent: function( order ) {          //console.log('Backbone.View.renderCurrent()');


            if( $.type(order) === 'string' ) {
                var currentQuestion = questionHistory.getCurrent( order );
            } else {
                var currentQuestion = questionHistory.getCurrent();
            }

            $('#questionContent').html( this.template( currentQuestion ) );
        },

        renderPrevious: function() {                //console.log('renderPrevious()');
            var currentQuestion  = questionHistory.getCurrent();
            var previousQuestion = questionHistory.previous( currentQuestion );

            $('#questionContent').html( this.template( previousQuestion ) );
        },

        //
        storeQuestion: function() {                 //console.log('Backbone.View.storeQuestion()');
            var text = this.input.val();
            if ( !text ) return;

            questionHistory.create({
                text  : text,
                order : questionHistory.nextOrder()
            });

        },

        //
        showTooltip: function(e) {
            /*
            var tooltip = $(".ui-tooltip-top");
            var val = this.input.val();
            tooltip.fadeOut();
            if (this.tooltipTimeout) {
                clearTimeout(this.tooltipTimeout);
            }

            if (val == '' || val == this.input.attr('placeholder')) return;

            var show = function() {
                tooltip.show().fadeIn();
            };
         this.tooltipTimeout = _.delay(show, 1000);
            */
        }

    }));


    // -- Editor Router

    var EditorRouter = new(Backbone.Router.extend({

        routes: {
            'editor'           : 'editor',  // #editor    // event: 'route:editor'
            'editor/v:version' : 'editor'   // #editor/v7 // event: 'route:editor'
        },

        // /editor and /editor/v# routes call render in the view
        editor: function( version ) {

            EditorView.renderCurrent( version );
        }

    }));

    // start monitoring hashchange events & dispatching routes
    Backbone.history.start();
});