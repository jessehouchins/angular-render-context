;(function(){ "use strict";

  angular.module('j4').directive('renderContext', function($rootScope, $route, $routeParams) {

    function RenderContext(depth) {
      this.depth = depth || 0
    }

    var RC = RenderContext.prototype

    RC.next = function() {
      return this._next = this._next || new RenderContext(this.depth + 1)
    }

    RC.prev = function() {
      return this._prev = this._prev || new RenderContext(this.depth - 1)
    }

    RC.is = function(context) {
      return this.val(this.depth) === context
    }

    RC.isNotSet = function() {
      return !this.val(this.depth)
    }

    RC.val = function(depth) {
      var current = $route.current || {}
      var action = current.action || ''
      return action.split('.')[depth || this.depth] || ''
    }

    var VALID_CONTEXT_SHIFTS = ['next', 'prev']

    return {
      restrict: 'EA',
      scope: true,
      link: {
        pre: function(scope, el, attrs) {
          var contextShift = attrs.renderContext
          var renderScope = scope
          var renderContext

          while (renderScope && !renderContext) {
            renderContext = renderScope.renderContext
            renderScope = renderScope.$parent
          }

          // Set render context on this child scope or show a warning.
          if (!renderContext || !contextShift) {
            scope.renderContext = renderContext || new RenderContext()
          } else if (VALID_CONTEXT_SHIFTS.indexOf(contextShift) === -1) {
            console.warn("RenderContext: Invalid render context requested.")
          } else {
            scope.renderContext = renderContext[contextShift]()
          }
        }
      }
    }

  })

})();
