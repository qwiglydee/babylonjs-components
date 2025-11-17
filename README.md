# babylonjs-components
Web components for babylonjs apps powered by [Lit](https://lit.dev/)

## Context

```html
<the-app>
  <!-- some existing babylonjs-unaware app -->

  <my3d-app id="main3d" param="..." param="...">
    <!-- babylonjs component, shadow dom contains canvas and everything -->

    <my3d-something param="..." param="...">
      <!-- a babylon-related component, using babylon internal APIs -->
    </my3d-something>
  </my3d-app>

  <our-something ref="#main3d">
    <!-- some integration component using /public API/ of my3d-app -->
  </our-something>

  <their-something>
    <!-- some third-party component than might be somehow related --> 
  </their-something>
</the-app>
```
