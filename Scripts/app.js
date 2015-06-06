(function () {

    var ErrorView = Backbone.View.extend({
        template: _.template($('#error-template').html()),
        el: '.error-container',
        render: function () {
            var html = this.template(this.model.toJSON());
            this.$el.html(html);
        }
    });

    var StateView = Backbone.View.extend({
        template: _.template($('#type-ahead-item-template').html()),
        render: function () {
            var html = this.template(this.model.toJSON());
            this.$el.html(html);
            return this;
        }
    });

    var TypeAheadView = Backbone.View.extend({
        initialize: function () {
            this.ascending = true;
        },
        el: '.type-ahead-container',
        events: {
            'keyup .search-state': 'keyup',
            'click .sort-box': 'changeSortOrder'
        },
        render: function () {
            this.$search = this.$el.find('.search-state');
            this.$sort = this.$el.find('.sort-box');
            this.$list = this.$el.find(".state-list");
            this.data = this.model.slice(0);
            this.reduced = this.data;
            this.renderList();
            return this;
        },
        /* search mixin */
        search: function (value) {
            var re = new RegExp(value, 'i');
            return this.data.filter(function (model) {
                return re.test(model.get("name"));
            });
        },
        /* sort mixin */
        sort: function (list, ascending, fn) {
            return list.sort(function (a, b) {
                a = fn(a);
                b = fn(b);
                return (ascending ? 1 : -1) * ((a == b) ? 0 : (a > b ? 1 : -1));
            });
        },
        changeSortOrder: function (evt) {
            this.ascending = this.$el.find('.sort-box:checked').length === 0;
            this.renderList();
        },
        filter: function() {
            this.reduced = this.search(this.$search.val()).slice(0);
            this.renderList();
        },
        renderList: function(){
            var l = this.$list.empty();
            var list = this.sort(this.reduced, this.ascending, function (model) { return model.get('name'); });
            $.each(list, function (idx, val) {
                var stateView = new StateView({ model: val });
                l.append(stateView.render().$el);
            });
        },
        keyup: function (evt) {
            switch (evt.keyCode) {
                case 40: // Down
                case 38: // Up
                case 16: // Shift
                case 17: // Ctrl
                case 18: // Alt
                case 13: // Enter
                case 27: // escape
                case 9: // Tab
                    break;
                default:
                    this.filter();
            }
            evt.stopPropagation();
            evt.preventDefault();
        }
        });

    var ErrorModel = Backbone.Model.extend({});

    var State = Backbone.Model.extend({});
    var States = Backbone.Collection.extend({
        url: "data/us_states.txt",
        model: State
    });

    var states = new States();
    states.fetch().then(
        function () {
            var typeAheadView = new TypeAheadView({ model: states });
            typeAheadView.render();
        },
        function (response) {
            var errorModel = new ErrorModel({
                error: 'Error getting data from '+ States.prototype.url + ': ' + response.status + ' ' + response.statusText
            });
            var errorView = new ErrorView({ model: errorModel });
            errorView.render();
        });
})();