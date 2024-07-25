# PageBuilder: Backend (Strapi-Plugin) - Developer Documentation

This README is intended for developers and provides essential information to enhance your technical understanding of the project. Inside, you'll find detailed documentation on the project's architecture, and key functionalities. In case you want to modify this project effectively and understand the underlying mechanisms of the software.

- The `PageBuilder: Backend` is a strapi-plugin (`@am-gmbh/pabu-strapi-plugin`, shortly called `pabu`) that enables your Strapi application to fulfill the role as the backend for the `Pagebuilder: Frontend (Next.js)`. 
- It comes with content-types that are being used internally by the PageBuilder to store data (e.g. data of your pages and the content-elements in `pbpage`) or "settings related" content-types that are meant to be used from within Strapi to configure the design of your site. (e.g. `global`, `store`, `contentElementSettings` ...) and also provides the APIs for the `PageBuilder: Frontend` to make use of these content-types.
- To improve the usability inside of Strapi it also comes with multiple `customFields` and some smaller tweaks and improvements to the Strapi-Admin-UI.

## Table of Contents
- [Settings: global](#settings-global)
- [Settings: store](#settings-store)
- [Settings: contentElementSettings](#settings-contentelementsettings)
- [Settings: custom](#settings-custom)
- [Settings: CMS Settings & pbemailsettings](#settings-cms-settings-and-pbemailsettings)
- [CustomFields](#customfields)
- [Generated Files: JSON & CSS](#generated-files-json-and-css)
- [Content-Elements and Content-Element-Settings](#content-elements-and-content-element-settings) - 🧠
- [How to: Add a custom Content-Element](#how-to-add-a-custom-content-element)
- [API-Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Mail: nodemailer](#mail-nodemailer)
- [Misc](#miscellaneous)

## Settings: global
The `global` singleType is used to configure the general style and behaviour of the website. Fine-tuning the viewport `breakpoints`, defining the content-width in `layout` and enable/disable various features of the `PageBuilder` will greatly improve the appearance of your website. 
**Naming:** Components that are used inside of `global` always end with `...c`! ("config")  

## Settings: store
The `store` (str) collectionType is a collection of reusable configurations. When configuring `global` or `contentElementSettings` you can pick from existing store entries and - if small adjustments to the `store`-entry needs to be done - simply adjust the value(s) in the `store`-element without (re)configuring all of your settings. 

These are:  
 - **color** (sclr) type: color
 - **background** (sbckgrnd) type: background    
 (Note: All `background`s are added to `config-contentelement-settings.json`. See: [Generated Files: JSON & CSS](#generated-files-json-and-css))
 - **richtext** (srchtxt) type: richtext
 - **arrows** (srrws) type: arrows
 - **typography** (stypgrphy) type: typography
 - **link** (slnk) type: link
 - **button** (sbttn) type: button
 - **font** (sfnt) type: font
 - **googlefont** (sgglfnt) type: font
 - **spaceX** (spcx) type: spaceX
 - **spaceY** (spy) type: spaceY

> 💡 Each component for the `store` **is required** (!) to:  
> - have a component-Name that starts with `s`!    
> - have a component-Name does not include any vocals & **have to has a `shortNameToNames` inside of `str`-Service!**     
> - have the attribute `strname`, `strinfo` **and** if it results in a **single value** (in `config-global.json` or `config-page-settings.json`) it  
> **should** also have the attribute `valueAttribute` (technicalField)!  

All `store`-Components are used in a `store`-Entry with a `name`-attribute (technicalField) that is generated automatically (combination of `component.name` & its values). This allows easier usage inside of the relation-Dropdown.
The `strinfo`-attribute is also mandatory. (visual reasons and for later development).   
Additionally do all `store`-Entries bring their own `struuid`-attribute (technicalField) for more safer way when importing or exporting. 

 > 💡 **Note:** To create a relation to a store-Entry the - [customField: store-values](#store-values) is required.

## Settings: contentElementSettings
The `contentElementSettings` (cesstr) collectionType is a collection of reusable configurations (like the  [store](#settings-store)) for your content-elements.   
They define the settings for contentElements of the same type. 
If there are **multiple** contentElementSettings of the **same content-element-type**, they will be displayed in the cfg-Modal by using `cfgStrContentElementSetting` in the contentElement.

> 💡  **Naming:** Components for `cesstr` always start with `cs...`! 
> - The name should not include any vocals & **have to has a `shortNameToNames` inside of `str`-Service!**     
> - They must have the attributes `strname` & `strinfo`.
  
These are:  
 - **headline** (cshdln) 
 - **richtext** (csrchtxt) 
 - **button** (csbttn)   
 - **form** (csfrm)   
 - **separator** (cssprtr)   
 - **spacers** (csspcr)   
 - **gallery** (csgllry)   
 - **text withimage** (cstwi)   
 - **image** (csmg)   
 - **image ticker** (csmgtckr)   
 - **carousel** (cscrsl)   
 - **multimedia** (csmltmd)   
 - **cards** (cscrds)   
 - **accordion** (csccrdn)   
  

## Settings: custom
The singleType `custom` provides 4 textareas (for the breakpoints defined in `global.responsive`) that can be used to write **custom CSS** to overwrite any configurable or hard-coded styling.  
Just search for an existing selector you want to overwrite or **create your own customClassName** (inside of the cfg-Modal of your content-element) and apply some fancy CSS to it. 
  
## Settings: CMS Settings and pbemailsettings
Settings that only have impact on "backend-stuff" like e-mail (`pbemailsettings`) or include settings that are used to setting up third-party-tools or configure the CMS for the content-manager ( `CMS Settings`).


## CustomFields
The PaBu Pagebuilder includes multiple **customFields**.   
If you want to add a field that is displayed or used in strapi-admin **you should always decide to use these customFields**. (if a matching customField does exist)  

- [store-value**s**](#store-values)  
Field for Store-Relations. For example if you want to use store-Entry (`spaceX`) inside of a content-Element-Setting.  

- [grouped-value**s**](#grouped-values)  
Groups similar values in one field.  
For example:  
`imageHeightMobile`, `imageHeightTablet`, `imageHeightDesktop` and `imageHeightWQHD` -> `imageHeight`: `{mobile: null, tablet: null, desktop: null, wqhd: null}`   
- [string-value](#string-value)  
Field for **string** value. 
- [integer-value](#integer-value)  
Field for **integer** value.
- [boolean-value](#boolean-value)  
Field for **boolean** value.
- [text-value](#text-value)  
Field for **text** value.  
- [json-value](#json-value)   
Field for **json** value. **Note:** This field is not production-ready and only used as field for `cfgStr...`-Fields or other technical fields that are not being used inside of Strapi.  


>  💡 **All of the above customFields** share the possibility to have **deployable** fieldAttribute labels and descriptions:   
> 
> "nameOfField": 
> - **fieldDescription**: By adding the name of the field as key in the `fieldDescriptions-en.json` in `pabu/admin/src/translations` you can add a descriptive text as value.
*You need to build admin again to actually see it!*   
>
> - **fieldLabel**: By adding the name of the field as key in the `fieldLabels-en.json` in `pabu/admin/src/translations` you can add a better or more understandable label as value.
*You need to build admin again to actually see it!* 
>
> With the **fieldLabel** you can circumvent the MySQL tableName limit of 64 characters or group your fields by using prefixes or simply choose more user-friendly labels for technical fields. 


- [hex-color](#hex-color)  
Used in Store (sclr): HEX-Color-Picker.  
Based on: https://github.com/strapi/strapi/tree/main/packages/plugins/color-picker  

### - store-values
This field is used to link to an entry of `contentElementSettings (cesstr)` or `store (str)`.  
`store-values`-customFields allow the selection of elements of a specific `storeType` inside of a specific `store`.
They can be `1:1` or `1:n`.  

**Usage:**  
```
    "exampleField": {
      "type": "customField",
      "customField": "plugin::pabu.store-values",
      "store": "str",
      "storeType": "color",
      "isOneToOne": false,
    },
```
**store:** *the name of the store*
>  "store": "str" | "cesstr" 

**storeType:** *the type of the component in the store*
> "storeType": "color"

**isOneToOne:** *singleSelect or multiSelect*
> isOneToOne: true | false -> *default to false (multiSelect)*      


**Example: singleOption:**
```
    "spaceX": {
      "type": "customField",
      "customField": "plugin::pabu.store-values",
      "store": "str",
      "storeType": "spaceX",
      "isOneToOne": true
    },
```

**Example: MultiOption**
```
    "fontColors": {
      "type": "customField",
      "customField": "plugin::pabu.store-values",
      "store": "str",
      "storeType": "color",
      "isOneToOne": false
    },
```

**MultiOption**-Dropdowns are mostly used to give the cmsUser in the frontend (in the configModal of contentElements) options that he can choose from.  
They can be used in three different ways:  
1. Select a single value: By selecting only a single value, the cmsUser can't choose between different options in the configModal regarding the configured attribute.   
2.  Select 'default' as (an) option: By selecting 'default' the cmsUser can choose between the different options and can on top of that use the "default styling" that the contentElement comes with initially. This can be used for example when no variation in specific attributes should be allowed.  
3. Select multiple values: The selected items are options for the cmsUser to pick from.   

> 💡 **Notes:** 
> - The value `-1` means that 'default' is allowed as option.
> - Elements that are deleted from the store but are still referenced in store-Value-Fields can be removed by using the 'Remove deleted elements'-Button. The provided id can be used to search in the strapi-logs for the delete event of the store-Entry.  
> **Delete**:  
> info: str: Delete typography: example typography [id: 24].  
> **Bulkdelete:**:  
> info: str: Bulk-Delete [ids: 8, 25].

---

### - grouped-values
**Usage:**  
```
"exampleField": {
  "type": "customField",
  "customField": "plugin::pabu.grouped-values",
  "default": { "horizontal": 10, "vertical": 5 },
  "fields": ["horizontal", "vertical"], // keys of json in db
  "fieldLabels": ["horizontal", "vertical"], // labels in strapi-admin
  "dataType": "integer" // type of value of json in db
  "inputType": "string" // type of input
}
```
**fields:** *name of json keys in db*
>  "fields": ["value1", "something"] 

**fieldLabels:** *readable labels in strapi-admin*
> "fieldLabels": ["labelForValue1", "something"]

**default:** *default values*
> default: {
    "mobile": 768,
    "tablet": 1366,
    "desktop": 2560,
    "wqhd": 3840
  }      

**inputType:** *type of input*
> inputType: "string" | "number"/"integer" -> *defaults to "string"*  

**dataType:** *type in db*
> dataType: "string" | "integer" | "float" -> *defaults to "string"*  

**Notes:**  
You should use `"dataType": "float"` only with `"inputType: "string"`.   

---

### - string-value
**Usage:** 
```
"exampleField": {
  "type": "customField",
  "customField": "plugin::pabu.string-value",
  "default": "This is an example"
}
``` 

**default:** *default values*
> default: "This is an example"  

**technicalField:** *hides the field in strapi-admin*
> "technicalField": true, 
  
---

### - integer-value
**Usage:** 
```
"exampleField": {
  "type": "customField",
  "customField": "plugin::pabu.integer-value",
  "default": 1337
}
``` 

**default:** *default values*
> default: 1337   

**technicalField:** *hides the field in strapi-admin*
> "technicalField": true, 

---

### - boolean-value
**Usage:**  
```
"exampleField": {
  "type": "customField",
  "customField": "plugin::pabu.boolean-value",
  "default": false
}
```

**default:** *default values*
> default: true

**technicalField:** *hides the field in strapi-admin*
> "technicalField": true, 
  
---

### - text-value
**Usage:**  
```
"exampleField": {
  "type": "customField",
  "customField": "plugin::pabu.text-value",
  "default": "This is an example"
}
```

**default:** *default values*
> default: "This is an example"  

**technicalField:** *hides the field in strapi-admin*
> "technicalField": true, 

---

### - json-value
This field is used to link to a store or `store-values`-field.  
It is primarily used in content-elements in the.  
For example as `cfgStrContentElementSetting` or to be able to select a specific value of a multiple of `store-values` inside the cfgModal.       
**Usage:**  
```
"exampleField": {
  "type": "customField",
  "customField": "plugin::pabu.json-value",
  "default": "This is an example"
}
```

**default:** *default values*
> default: "This is an example"  

**technicalField:** *hides the field in strapi-admin*
> "technicalField": true,  

> 💡 **Note:** This is highly recommended for this type of customFields!


# Usage of json-value-Fields (for example: cfgStr-Fields in contentElements)  
`cfgStr...`-Fields are `json-value`-customFields that allow the selection of a value from multiple `store`-Values (str/cesstr).


```
    "cfgStrBackgroundColor": {
      "type": "customField",
      "customField": "plugin::pabu.json-value",
      "technicalField": true,
      "default": {
        "store": "cesstr",
        "storeType": "color",
        "settingsField": "bgColors",
        "values": []
      }
    },
```

**Example:**  
For example a `cfgStrBackgroundColor`-Field would store the selected value from the `bgColors`-settingsField.    
```
    "cfgStrBackgroundColor": {
      "type": "customField",
      "customField": "plugin::pabu.json-value",
      "technicalField": true,
      "default": {
        "store": "cesstr",
        "storeType": "color",
        "settingsField": "bgColors",
        "values": [3]
      }
    },
```

Example `bgColors`-Value:  
```
{
        "store": "str",
        "storeType": "color",
        "values": [1, 2, 3]
        "data": {
          "1": (data of str.color with id: 1)...,
          "2": (data of str.color with id: 2)...,
          "3": (data of str.color with id: 3)...
        }
      }
```
> 💡 **Note:** The value `-1` means that 'default' is allowed as option.

> ❗ **Note:** The `data`-Attribute is added in the process of JSON-Generation. It always displays the current state. If you have deleted a store-Entry or updated the value of a store-Entry while it is referenced in another Entry **the deletion/update will have effect immediately.**  

**More `json-value`-Examples:**
- [cfgInfo or: Where to store technical/custom data](#cfginfo)
- [cfgStrInner... or: How to include headline/button/richtext inside of contentElementSetting](#cfgstrinner)

---
### - hex-color   
**Usage:**  
```
"exampleField": {
  "type": "customField",
  "customField": "plugin::pabu.hex-color",
  "default": "#333333"
}
```

**Configuration:**  
> "default": "#333333", // hex color code  

## Generated Files: JSON and CSS
### JSON  
`glbl` & `cesstr` Entries result (also) in `config-...`-JSON-Files:  
`config-contentelement-settings.json` & `config-global.json`.
Those are fetched by the `PageBuilder: Frontend`.   


### CSS 
`glbl` & `str` Entries have impact on the CSS that is used by the `PageBuilder: Frontend`. When updating or deleting these entries, the current state gets transformed to CSS.

> 💡 **Note:** The CSS of `custom` is always added **to the end** of the generated CSS.  

**For development & testing:**  Have a look inside `public/assets/css-global.css` to get a better understanding about the usage of `str`-Elements in the frontend.  
**For production:**  `public/assets/css-global.min.css`. (minified version)

**store**-entries **by className**:  
`.str-typography-{id}` / `.str-typography-{htmlElement}-0`  
The oldest entry of each `htmlElement` is the **default**.   
The default can be used by for example `h5` or `.h5` or `.str-typography-h5-0`.
All other typographys can be used by `.str-typography-{id}`.  

`.str-button-{id}`   
`.str-link-{id}`   
`.str-background-{id}`    
`.str-background-{id}-preview`  
`.str-color-{id}` (can be used to overwrite selected typography color!)   
`.str-font-{id}` (can be used to overwrite selected typography font!)  
`.str-arrows-{id}` (and `.left-arrow` & `.right-arrow` inside)

**RichText specific:**   
`.cesstr-richtext-{id}` with generic classNames for: `.rte-p`, `.rte-h1`, `.rte-h2`, `.rte-h3`, `.rte-h4`, `.rte-h5`, `.rte-h6`, `.rte-link`.  
And `.rte-color-1`, `.rte-color-2` ... with the configured colors in the contentElementSettings: RichText Element.  

**store**-entries **by variable**:  
`--str-color-{id}` (can be used like `var(--str-color-3)`)   
`--str-font-{id}` (can be used like `var(--str-color-3)`)  

> 💡 **Note:** We strongly encourage you to have look inside of `public/assets/css-global.css` to get a better understanding about the CSS that is generated for you.

## Content-Elements and Content-Element-Settings
Content-Elements are the components that are used inside of the `page`. They include the content and their **individual** configuration (done in the cfg-Modal). 
Their design and behaviour is mainly the combination of the React-Component in the `PageBuilder: Frontend` which uses the **contentElementSettings** configuration and gets styled by the generated CSS (that includes `store`-Elements and configuration of `global`).


## How to: Add a custom Content-Element
> 💡 **Note:**  Feel free to refactor from an existing content-element! This will make your work much easier. 
  
- Create the `contentElement`-Component and add it to the dynamic-zone of `pbpage`-collectionType. 
- Create the `contentElementSettings`-Component and add it to the dynamic-zone of `cesstr`-collectionType. 
> 💡 **Note:**  Don't forget to adjust `shortNameToNames` in the `str`-service. 

> 💡 **Note:**  Even if you do not plan to have any settings for your content-element you should create a `contentElementSettings`-Component and atleast add `spaceX`, `spaceY` to it.   

At that point you can follow along the `PageBuilder: Frontend` Developer Documentation ([README.md (Next.js)](../../../../nextjs/README.md#adding-a-content-element)) about how to create the React-Component for your content-element in Next.js.

> ❗ If you have added custom content-element(s) to the `PageBuilder` you need to be extra cautious when updating to a newer version of the `PageBuilder`.   

## API-Endpoints
You'll find all _pabu-sepcific_ API-Endpoints inside  `plugins/pabu/server/routes` & `plugins/pabu/server/controllers`.
The best way to make use of them is to call them from within `PageBuilder: Frontend (Next.Js)` by using an already existing service-method.

> 💡  Those endpoints were not intended to be used from another service than our `PageBuilder: Frontend`.  

**Examples:**

<details>
 <summary><code>GET</code> <code><b>/search/suggest/{searchString}</b></code> <code>(Suggests words based on searchString for the searchInput)</code></summary>

##### Parameters

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | `searchString` |  required | string   | the (beginning) characters of the searchString        |


##### Responses
> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `["searchSuggestion 1", ...]`                              |
</details>

**Usage:** So instead of creating a completely new service in Next.js for this endpoint, it might be enough to just search for the route of the endpoint (like `/search/suggest`) to find the already existing `getSearchSuggestions()`-service and use it insted.   

---


<details>
 <summary><code>POST</code> <code><b>/pages/update</b></code> <code>(Update pageDetails)</code></summary>

##### Parameters
> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | None      |  required | `{id: number; name: string; url: string; refId: umber; ... }`   | N/A  |

##### Responses
> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `["searchSuggestion 1", ...]`                            |
</details>

---

<details>
 <summary><code>DELETE</code> <code><b>/pages/delete/{id}</b></code> <code>(Deletes the page with id)</code></summary>

##### Parameters

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | `id` |  required | integer   | id of page you want to delete        |


##### Responses
> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                |                             |
> | `400`         | `application/json`                | `{"code":"400","message":"Bad Request"}`                             |
</details>


## Environment Variables

The following environment variables are **required** to use the `pabu`-plugin.
Make sure that you add them to your `strapi/.env`-file. 
````sh
### PaBu: General ###
CMS_FEATURES=core
# URL of your Next.js frontend
PABU_PUBLIC_FRONTEND_URL=http://127.0.0.1:3000
# URL of your Strapi Application and Next.js frontend
PABU_CORS_ORIGINS="http://localhost:3000, http://127.0.0.1:3000, http://127.0.0.1:1337, http://localhost:1337"

### PaBu: Mail ###
PABU_EMAIL_AUTO_CREATE=true
EMAIL_PROVIDER=nodemailer
EMAIL_SMTP_HOST=localhost
EMAIL_SMTP_PORT=25
EMAIL_SMTP_USER=xxXXXXxxxxXXX
EMAIL_SMTP_PASS=xxXXXXxxxxXXX
EMAIL_ADDRESS_FROM=aaaaaa@bbbbbb.com
EMAIL_ADDRESS_REPLY=ccccccc@dddddd.com

```` 
For more information about the Strapi Environment variables: [Strapi Environment variables](https://docs.strapi.io/dev-docs/configurations/environment)
````sh
## Strapi
# ADMIN_JWT_SECRET=?
# APP_KEYS=?,?,?
# API_TOKEN_SALT=?
# TRANSFER_TOKEN_SALT=?

## Database
# DATABASE_CLIENT=mysql
# DATABASE_HOST=127.0.0.1
# DATABASE_PORT=3306
# DATABASE_NAME=example
# DATABASE_USERNAME=example
# DATABASE_PASSWORD=example
# DATABASE_SSL=false
```` 

## Mail: Nodemailer
If you want to add the `provider-email-nodemailer` plugin to your Strapi you need to install `@strapi/provider-email-nodemailer`.  
Make sure to also adjust your `/config/plugins`-File.
  ````js
    // ...
    email: {
      config: {
        provider: process.env.EMAIL_PROVIDER,
        providerOptions: {
          host: process.env.EMAIL_SMTP_HOST,
          port: Number(String(process.env.EMAIL_SMTP_PORT)),
          auth: {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASS,
          },
          secure: false,
          ignoreTLS: true,
        },
        settings: {
          defaultFrom: process.env.EMAIL_ADDRESS_FROM,
          defaultReplyTo: process.env.EMAIL_ADDRESS_REPLY,
        },
      },
    },
    // ...
  ````

## Miscellaneous
### cfgInfo
Allows storage of custom data. 
Currently used for create-Date (ISO-String) of the contentElement and the CMS_PABU_VERSION (e.g. "1.0") that was used when the contentElement was created.  
This should be added to a contentElement.  
**Example:**  
```
  "cfgInfo": {
    "type": "customField",
    "customField": "plugin::pabu.json-value",
    "technicalField": true,
    "default": null
  },
```
**Outcome-Example:**  
```
  "cfgInfo": {
    "created": "2024-06-11T06:24:56.286Z",
    "version": "1.0"
  }
```

### cfgStrInner...  
`headline`, `button` and `richtext` can be reused as **contentElementSetting** inside of another cesstr-Entry.  
To store the selection inside of each individual content-Elements-config-Modal you need to add **cfgStrInner...**-Attributes to your content-element!
In this case the `settingsField`-Attribute can be used as path like `"button.buttons"`.

**Example:**
**ContentElementSetting (textwithimage (twi)):**
```
...
    "headline": {
      "type": "customField",
      "customField": "plugin::pabu.store-values",
      "store": "cesstr",
      "storeType": "headline",
      "isOneToOne": true
    },
    "richtext": {
      "type": "customField",
      "customField": "plugin::pabu.store-values",
      "store": "cesstr",
      "storeType": "richtext",
      "isOneToOne": true
    },
    "button": {
      "type": "customField",
      "customField": "plugin::pabu.store-values",
      "store": "cesstr",
      "storeType": "button",
      "isOneToOne": true
    },
...
```
**ContentElement** 
```
...
"cfgStrInnerTypography": {
      "type": "customField",
      "customField": "plugin::pabu.json-value",
      "technicalField": true,
      "default": {
        "store": "str",
        "settingsField": "headline.typographys",
        "storeType": "typography",
        "values": []
      }
    },
    "cfgStrInnerFont": {
      "type": "customField",
      "customField": "plugin::pabu.json-value",
      "technicalField": true,
      "default": {
        "store": "str",
        "settingsField": "headline.fonts",
        "storeType": "font",
        "values": []
      }
    },
    "cfgStrInnerFontColor": {
      "type": "customField",
      "customField": "plugin::pabu.json-value",
      "technicalField": true,
      "default": {
        "store": "str",
        "settingsField": "headline.fontColors",
        "storeType": "color",
        "values": []
      }
    },
    "cfgStrInnerButton": {
      "type": "customField",
      "customField": "plugin::pabu.json-value",
      "technicalField": true,
      "default": {
        "store": "str",
        "settingsField": "button.buttons",
        "storeType": "button",
        "values": []
      }
    },
...
```


> ❗ **Note:** (Re-)using a cesstr inside of a cesstr and configure the "inner multi-select values" from within the cfgModal is currently only possible as single-select. (isOneToOne: true).   
Example: You can't include multiple `cesstr.button`s in `cards` with each `cesstr.buttons` having an option to select from multiple `str.button`s.  

> ❗ **Note:** The (re)used cesstr has to be "simple" and not include other cesstr it-self.   
Example: Do not include `cards` (that includes **one** `cesstr.button`) in something like `super-cards`.

### Local Development
> ❗ **Warning:** Changing `pabu`-specific files (modifying a schema, changing logic, ...) might cause problems with future updates!

Make sure you've setup your environment (local: `.env`) correctly. (`nodeVersion` (**18.17.0**), `DATABASE`(**pabu**) ...)    

**To start strapi locally for the first time:**  

> /strapi  
- Terminal (1) > npm install

> /strapi/src/plugins/pabu  
- Terminal (2): > npm install 
- Terminal (2): > npm run develop *(this starts tsc server)* 
- Terminal (3): > npm run admin-develop *(this starts tsc admin)* 
 
> /strapi  
- Terminal (1) > npm run build
- Terminal (1) > npm run develop

**Notes:**
- `npm run develop` (in `/strapi`) move components from `/strapi/src/plugins/pabu/server/components` into `/strapi/src/components`.
- Changes in `/strapi/src/plugins/pabu/admin` require a new build to be reflected.

    
