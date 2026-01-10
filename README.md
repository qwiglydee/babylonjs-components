# babylonjs-components

A boilerplate for creating [BabylonJS](https://www.babylonjs.com/) web-modules from web-components powered by [Lit](https://lit.dev/).

The web-modules assumed to be some consumer-level functional blocks integrated to existing web pages and apps, 
implemented with arbitrary frameworks and totally babylon-unaware.

The web-components are implemented with Lit and provide standard HTML/DOM-based API for easy integration with any external scripts and apps.

## Content

- `src/my/`: all the project-related code 
  - `base/`: base classes implementing core functionality
  - `controllers/`: Lit-oriented reactive controllers to add some functionality to components
  - `properties/`: Lit-oriented property value converters
  - `elements/`: components of the project
    - `gui2d/`: components for gui2d layer  
- `src/our/`: sample integration code for babylon-unaware app 
- `src/lib/`: babylonjs-related snippets, unrelated to components
- `src/utils/`: some general utils unrelated to anything
- `tests/`: tests for some core and base functionality
- `index.html`: demo-page for experimenting and development
- `public/`: static assets for demo app

The base classes provide some core functionality ans a scheme of integration them all together. 
This base is convered by tests and documented. 

All the rest is basically draft snippets. 
They can be used as is or customized for specific use cases.

All gui-2d stuff is in sepaate `gui` branch.

# Setup

Sample page setup:

```html
<!-- the app is a placeholder representing babylon-unaware hosting app 
     it is an empty wrapper and does nothing 
     except debugging and providing global reference to main component -->
<the-app>
    <!-- the main component contains shadow dom with canvas, loading screen, etc
         it provides engine, scene, and stuff -->
    <b3d-main rightHanded>
        <!-- other components contrbute something to the scene 
             thy are proxy-components to control underlying scene entities via DOM API -->

        <b3d-camera-basic id="cam0" position="[5, 1.75, 5]"></b3d-camera-basic>
        <b3d-camera-orbit id="cam1" orbit="[45, 60, 10]"></b3d-camera-orbit>
        <b3d-camera-look id="cam2" selected autoZoom defaults="[45, 45, 10]"></b3d-camera-look>

        <b3d-sky-env src="assets/studio.env">
            <b3d-sky-box blurring="0.75" intensity="0.25"></b3d-sky-box>
        </b3d-sky-env>

        <b3d-stuff id="ball" shape="sphere"></b3d-stuff>
        <b3d-stuff id="box" class="foo" shape="cube" size="2" position="[-3, 1, -5]" texture="assets/checker.png"></b3d-stuff>
        <b3d-stuff id="cone" class="foo bar" shape="cone" positionRnd="5" texture="assets/checker.png"></b3d-stuff>

        <b3d-ground-flat size="auto" src="assets/ground.png" color="#102040"></b3d-ground-flat>
        
        <!-- the utility layer provides additional scene for utility stuff -->
        <b3d-utility-layer events>
            <b3d-ground-grid size="auto" src="assets/ground.png" color="#80FFFF"></b3d-ground-grid>
            <b3d-axesview></b3d-axesview>

            <!-- the gui layer provides texture layer for gui -->
            <b2g-gui-layer foreground>
                <!-- contains some stuff from `gui` branch -->
            <b2g-gui-layer>
        </b3d-utility-layer>

        <b3d-highlighter color="#F0F000"></b3d-highlighter>
        
        <div slot="overlay" style="position: absolute; left: 0; top: 0">
          <!-- some html on top of the scene -->
        </div>
    </b3d-main>

    <!-- a sample integration component outside babylon context, 
         it's linked to the `b3d-main` via `the-app` -->
    <our-stuff-tools>
        <!-- contains some plain kinda third-party html -->
    </our-stuff-tools>
</the-app>
```

# Features

General features of the components:
- the components can be created and configured manually as static html 
- or by a html template system on backend
- they can be created/removed at runtime using standard DOM API
- also, they can be included in the shadow dom of a customized `b3d-main` element
- HTML attributes used to provide initialization parameters
- (some) DOM properties may affect internal state of underlying scene entities  
- (some) DOM properties may reflect actual state of the entities

In particular, for standard nodes:
- `id` and `name` of elements translated to corresponding babylon `id` and `name`
- tokens from `class` translated to babylon tags, just like the developers told us
- `disabled` attribute and `enabled` property are synchronized with internal `isEnabled`
- `hidden` attribute and `visible` property are synchornized with internal `isVisible`
- `selected` attribute/property of a camera is synchornized with scene active camera

# Usage

The repository is essentially a boilerplate or template to develop some specific apps.

## git

The head branch in this repo is `stub`, because the `main` is for a particular project.

Assumed git scenaio: 
- clone the repository into a new project (without full history and renamed to something other then origin)
  ```
  git clone --depth 1 -o backstream URL DIR
  ```
- create new head `main` branch for the project
  ```
  git checkout -b main
  ```
- create a proper remote `origin` and ignore `backstream` 
- make wahatever changes in the main branch 
- push to origin

The `backstream` (this repo) will eventually update with some changes and fixes.
That way it should be less painful to merge or cherry-picking the changes. 

## build

The repo configured to use [webpack](https://webpack.js.org/) to create separate bundles:
- `mybabylon` from `src/my` is the module of project, 
- `ourapp` from `src/our` is hosting app placeholder and integration scripts
- `lit` is just shared lit framework
- `babylonjs` is assumingly tree-shaked of everything from babylon framework

## dev

The dev server is also webpack configured to run multi-page app with `index.html` as default, 
but not limited to that, and without the nasty SPA redirection. 
It can easily serve many pages, as long as they have all the scripts injected.

## test

Tests are written with pure [Playwright](https://playwright.dev) using html injections. Expecting webpack dev server to inject all the bundles into test pages.

# Disclamer

This is still an experimental project and contains some draft and inconsistent code.
The last version of it is not yet battle-tested in any real projects.

Feel free to try it out. 
