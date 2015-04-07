# angular-render-context

A surprisingly simple Angular.js directive for managing nested views, routing, and rendering.

---------------------------

### Instalation

Require `'j4'` as an app dependency and include this file in your layout or main JS package.


### Example Routes

```
    .when('/users/:userId', { action: 'app.user.dashboard' })
    .when('/users/:userId/messages', { action: 'app.user.messages' })
    .when('/users/:userId/account', { action: 'app.user.account' })
    .otherwise({ action: 'error.404' })
```


### Example Template

```
    <div render-context="next">
      <div ng-if="renderContext.is('dashboard')" user-dashboard user="user" />
      <div ng-if="renderContext.is('messages')" user-messages user="user" />
      <div ng-if="renderContext.is('account')" user-account user="user" />
    </div>
```


### Directive Options

  * `render-context="next"`     -- Set the render context to the next context (deeper).
  * `render-context="prev"`     -- Set the render context to the previous context (shallower).
  * `render-context`            -- Usefull to establish a render context from inside a directive with isolate scope.


### Methods

Methods are available on the $scope.renderContext object.

  * `.next()`           -- Returns the next context (deeper)
  * `.prev()`           -- Returns the previous context (shallower)
  * `.is('context')`    -- Return true if the contexts match
  * `.isNotSet()`       -- Returns true if the context is falsy
