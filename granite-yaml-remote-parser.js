/**
@license MIT
Copyright (c) 2016 Horacio "LostInBrittany" Gonzalez

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import './granite-yaml-parser.js';
import '@polymer/iron-ajax/iron-ajax.js';
/**
 * `granite-yaml-remote-parser`
 * 
 * A parser of YAML that grabs a YAML file from an URL and parses it into JS object.
 * It uses JS-YAML as parser and `iron-ajax` to grab the file
 *
 * With `auto` set to `true`, the element performs a request whenever
 * its `url`, `params` or `body` properties are changed. Automatically generated
 * requests will be debounced in the case that multiple attributes are changed
 * sequentially.
 *      
 * @customElement
 * @polymer
 * @demo demo/demo-granite-yaml-remote-parser.html
 */
class GraniteYamlRemoteParser extends PolymerElement {
  static get template() {
    return html`
    <iron-ajax id="ironAjax" url="[[url]]" params="[[params]]" method="[[method]]" headers="[[headers]]" content-type="[[contentType]]" body="[[body]]" sync="[[sync]]" handle-as="text" with-credentials="[[withCredentials]]" timeout="[[timeout]]" auto="[[auto]]" verbose="[[verbose]]" last-request="{{lastRequest}}" last-response="{{lastResponse}}" last-error="{{lastError}}" bubbles="[[bubbles]]" active-requests="{{activeRequests}}" debounce-duration="[[debounceDuration]]" loading="{{loading}}" on-request="_handleRequest" on-response="_handleResponse" on-error="_handleResponse"></iron-ajax>
        
    <granite-yaml-parser id="granite-yaml-parser" yaml="[[_yaml]]" obj="{{obj}}" multi-document="[[multiDocument]]" unsafe="[[unsafe]]" on-yaml-parsed="_onYamlParsed" debug=""></granite-yaml-parser>
`;
  }

  static get is() { return 'granite-yaml-remote-parser'; }

  /**
    * Fired when a YAML text have been decoded.
    *
    * @event yaml-parsed
    */

  static get properties() {
    return {
      /**
       * The URL of the remote YAML file
       */
      url: {
        type: String,
        value: '',
      },
      /**
      * An object that contains query parameters to be appended to the
      * specified `url` when generating a request. If you wish to set the body
      * content when making a POST request, you should use the `body` property
      * instead.
      */
      params: {
        type: Object,
        value: function() {
          return {};
        },
      },

      /**
      * The HTTP method to use such as 'GET', 'POST', 'PUT', or 'DELETE'.
      * Default is 'GET'.
      */
      method: {
        type: String,
        value: 'GET',
      },
      /**
      * HTTP request headers to send.
      *
      * Example:
      *
      *     <iron-ajax
      *         auto
      *         url="http://somesite.com"
      *         headers='{"X-Requested-With": "XMLHttpRequest"}'
      *         handle-as="json"></iron-ajax>
      *
      * Note: setting a `Content-Type` header here will override the value
      * specified by the `contentType` property of this element.
      */
      headers: {
        type: Object,
        value: function() {
          return {};
        },
      },
      /**
      * Content type to use when sending data. If the `contentType` property
      * is set and a `Content-Type` header is specified in the `headers`
      * property, the `headers` property value will take precedence.
      *
      * Varies the handling of the `body` param.
      */
      contentType: {
        type: String,
        value: null,
      },
      /**
      * Body content to send with the request, typically used with "POST"
      * requests.
      *
      * If body is a string it will be sent unmodified.
      *
      * If Content-Type is set to a value listed below, then
      * the body will be encoded accordingly.
      *
      *    * `content-type="application/json"`
      *      * body is encoded like `{"foo":"bar baz","x":1}`
      *    * `content-type="application/x-www-form-urlencoded"`
      *      * body is encoded like `foo=bar+baz&x=1`
      *
      * Otherwise the body will be passed to the browser unmodified, and it
      * will handle any encoding (e.g. for FormData, Blob, ArrayBuffer).
      *
      * @type (ArrayBuffer|ArrayBufferView|Blob|Document|FormData|null|string|undefined|Object)
      */
      body: {
        type: Object,
        value: null,
      },
      /**
      * Toggle whether XHR is synchronous or asynchronous. Don't change this
      * to true unless You Know What You Are Doing™.
      */
      sync: {
        type: Boolean,
        value: false,
      },
      /**
      * Set the withCredentials flag on the request.
      */
      withCredentials: {
        type: Boolean,
        value: false,
      },
      /**
      * Set the timeout flag on the request.
      */
      timeout: {
        type: Number,
        value: 0,
      },
      /**
      * If true, automatically performs an Ajax request when either `url` or
      * `params` changes.
      */
      auto: {
        type: Boolean,
        value: false,
      },
      /**
      * If true, error messages will automatically be logged to the console.
      */
      verbose: {
        type: Boolean,
        value: false,
      },
      /**
      * The most recent request made by this iron-ajax element.
      */
      lastRequest: {
        type: Object,
        notify: true,
        readOnly: true,
      },
      /**
      * True while lastRequest is in flight.
      */
      loading: {
        type: Boolean,
        notify: true,
        readOnly: true,
      },
      /**
      * lastRequest's response.
      *
      * Note that lastResponse and lastError are set when lastRequest finishes,
      * so if loading is true, then lastResponse and lastError will correspond
      * to the result of the previous request.
      *
      * The type of the response is determined by the value of `handleAs` at
      * the time that the request was generated.
      *
      * @type {Object}
      */
      lastResponse: {
        type: Object,
        notify: true,
        readOnly: true,
      },
      /**
      * lastRequest's error, if any.
      *
      * @type {Object}
      */
      lastError: {
        type: Object,
        notify: true,
        readOnly: true,
      },
      /**
        * An Array of all in-flight requests originating from this iron-ajax
        * element.
        */
      activeRequests: {
        type: Array,
        notify: true,
        readOnly: true,
        value: function() {
          return [];
        },
      },
      /**
        * Length of time in milliseconds to debounce multiple automatically generated requests.
        */
      debounceDuration: {
        type: Number,
        value: 0,
        notify: true,
      },
      /**
      * By default, iron-ajax's events do not bubble. Setting this attribute will cause its
      * request and response events as well as its iron-ajax-request, -response,  and -error
      * events to bubble to the window object. The vanilla error event never bubbles when
      * using shadow dom even if this.bubbles is true because a scoped flag is not passed with
      * it (first link) and because the shadow dom spec did not used to allow certain events,
      * including events named error, to leak outside of shadow trees (second link).
      * https://www.w3.org/TR/shadow-dom/#scoped-flag
      * https://www.w3.org/TR/2015/WD-shadow-dom-20151215/#events-that-are-not-leaked-into-ancestor-trees
      */
      bubbles: {
        type: Boolean,
        value: false,
      },
      /**
      * If true debug logs are sent to the console
      */
      debug: {
          type: Boolean,
          value: false,
      },
      /**
       * If `true` YS-YAML uses `load` instead of `safeLoad`.
       * Use with care with untrusted sources.
       */
      unsafe: {
        type: Boolean,
        value: false,
      },
      /**
      * If true parsing deals with multi-document sources
      */
      multiDocument: {
          type: Boolean,
          value: false,
      },
      /**
       * The YAML text to parse
       */
      _yaml: {
        type: String,
        value: '',
      },
      /**
       * The JS object resulting from parsing `yaml`
       */
      obj: {
        type: Object,
        notify: true,
      },
    };
  }

  _onYamlParsed(evt) {
    evt.stopPropagation();
    if (this.debug) { console.log('[granite-yaml-remote-parser] _onYamlParsed', evt.detail); }
    this.dispatchEvent(new CustomEvent('yaml-parsed', {detail: evt.detail}));
  }

  _handleResponse(evt, ironRequest) {
    evt.stopPropagation();
    if (this.debug) { console.log('[granite-yaml-remote-parser] _onResponse', ironRequest.response); }
    this._yaml = ironRequest.response;
  }

  _handleRequest(evt, ironRequest) {
    evt.stopPropagation();
    if (this.debug) { console.log('[granite-yaml-remote-parser] _onRequest', ironRequest); }
  }

  _handleError(evt, error) {
    evt.stopPropagation();
    if (this.debug) { console.log('[granite-yaml-remote-parser] _onError', error); }
  }


  // *****************************************************************************************
  // Instance methods
  // *****************************************************************************************
  /**
  * Performs an AJAX request to the specified URL.
  *
  * @return {!IronRequestElement}
  */
  generateRequest() {
    return this.$.ironAjax.generateRequest();
  }
}

window.customElements.define(GraniteYamlRemoteParser.is, GraniteYamlRemoteParser);
