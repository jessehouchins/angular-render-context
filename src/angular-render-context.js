;(function(){ "use strict";

  /*

    README: https://github.com/jessehouchins/angular-render-context

    INSTALLATION: Require `renderContext` as a dependency in your app

    TEMPLATE EXAMPLES: Given a route action of 'app.team.roster.players':

      renderContext.layout === 'app'          => true
      renderContext.app                       => truthy
      renderContext.team.roster               => truthy
      renderContext.roster.players            => truthy
      renderContext.team.players              => falsy
      renderContext.players.prev === 'roster' => true
      renderContext.players.prev === 'team'   => false
      renderContext.players.after.team        => truthy
      renderContext.team.before.players       => truthy

    CONTROLLER EXAMPLE: inject `renderContext` use the `.get()` method...

      controller: function(renderContext) {
        var isRosterPlayers = !!renderContext.get('roster.players')
      }

  */


  var RC = angular.module('renderContext', [])

  RC.run(function($rootScope, $route) {

    function RenderContext() {
      this._update()
      $rootScope.constructor.prototype.renderContext = this
      $rootScope.$on('$routeChangeSuccess', this._update.bind(this))
    }

    RenderContext.prototype._update = function() {
      this._reset()

      var root = this
      var current = $route.current || {}
      var action = current.action || ''
      var contextNames = action.split('.')
      var contextName
      var prevContext = {} // temp object for simple logic below
      var prevContextName
      var descendents = []

      root.is = {}
      root.is[action] = true
      root.layout = contextNames[0]

      while (contextName = contextNames.shift()) {
        var nextContextName = contextNames[0]

        // Build the context object and link it in the chain
        var context = root[contextName] = prevContext[contextName] = {
          prev: prevContextName,
          next: nextContextName,
          before: _.object(contextNames, contextNames),
          after: _.object(descendents, descendents)
        }

        // setup for the next loop
        if (nextContextName) {
          prevContext = context
          prevContextName = contextName
          descendents.push(contextName)
        }
      }
    }

    RenderContext.prototype._reset = function() {
      for (var contextName in this) {
        if (typeof this[contextName] !== 'function') delete this[contextName]
      }
    }

    RenderContext.prototype.get = function(path) {
      var context = this
      var contextNames = path.split('.')
      var contextName

      while (contextName = contextNames.shift()) {
        context = context[contextName]
        if (!context) return
      }

      return context
    }

    RC.value('renderContext', new RenderContext())

  })

})();
