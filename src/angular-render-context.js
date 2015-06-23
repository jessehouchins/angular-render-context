;(function(){ "use strict";

  // README: https://github.com/jessehouchins/angular-render-context

  var RC = angular.module('renderContext', [])
  var renderContext
  var contextUrl

  RC.run(function($rootScope, $route, $routeParams, $location) {

    function RenderContext() {
      // only one instance per app
      if (renderContext) return renderContext

      this._update()
      $rootScope.constructor.prototype.renderContext = this
      $rootScope.$on('$routeChangeSuccess', this._update.bind(this))

      return renderContext = this
    }

    RenderContext.prototype._update = function() {
      var root = this
      var current = $route.current || {}
      var currentContext = current.context || ''
      var contextNames = currentContext.split('.')
      var contextName
      var prevContext = {} // temp object for simple logic below
      var prevContextName
      var descendents = []
      var contexts = root.contexts = root.contexts || []

      this._reset()

      root.context = currentContext
      root.layout = contextNames[0]

      while (contextName = contextNames.shift()) {
        contexts.push(contextName)
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

    // removes custom context attributes
    RenderContext.prototype._reset = function() {
      while (var contextName = this.contexts.shift())
        delete this[contextName]
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

    RenderContext.prototype.goto = function(context, contextParams, replace) {
      function setLocation() {
        if (replace) $location.replace()
        $location.path(contextUrl(context, contextParams))
      }
      if ($rootScope.$$phase) setLocation()
      else $rootScope.$apply(setLocation)
    }

    RenderContext.prototype.backto = function(context, replace) {
      var index = renderContext.context.lastIndexOf(context)
      if (index < 0) return false // desired context not found in current context
      context = renderContext.context.substring(0, index) + context
      renderContext.goto(context, {}, replace)
    }

    contextUrl = function(context, contextParams, $el) {
      var contextMatcher = new RegExp(context)
      var url
      var route
      var contextFound

      // Find the context
      for (url in $route.routes) {
        route = $route.routes[url]
        context = route.context
        if (context && context.match(contextMatcher) && (contextFound = true)) break
      }

      if (!contextFound) throw new Error('No route found for the `'+context+'` context.')

      for (var i in route.keys) {
        var key = route.keys[i].name
        var src = contextParams && (key in contextParams) ? contextParams : $routeParams
        var paramValue = src[key]
        if (paramValue === undefined) {
          if ($el) console.error("Render Context Error: ", $el)
          throw new Error('Route for `'+context+'` requires the `'+key+'` param.')
        }
        url = url.replace(':' + key, paramValue)
      }

      return url
    }

    renderContext = new RenderContext()

  })

  RC.factory('renderContext', function(){
    return renderContext
  })

  RC.directive('gotoContext', function() {
    return {
      priority: 100, // before ngHref
      scope: {
        context: '@gotoContext',
        contextParams: '='
      },
      link: function($scope, $el, $attrs) {
        var context = $scope.context
        var contextParams = $scope.contextParams || {}

        $el.on('click', function updateLocation(e){
          $scope.renderContext.goto(context, contextParams, 'replaceContext' in $attrs)
        })

        // Update the href with references to local params
        if ($el.is('a')) $scope.$watch('contextParams', function updateHref() {
          $attrs.$set('href', contextUrl(context, contextParams, $el))
        })
      }
    }
  })

  RC.directive('backtoContext', function() {
    return {
      priority: 100, // before ngHref
      scope: {
        context: '@backtoContext'
      },
      link: function($scope, $el, $attrs) {

        $el.on('click', function updateLocation(e){
          $scope.renderContext.backto($scope.context, 'replaceContext' in $attrs)
        })

        // Update the href with references to local params
        if ($el.is('a')) $attrs.$set('href', contextUrl($scope.context, {}, $el))
      }
    }
  })

})();
