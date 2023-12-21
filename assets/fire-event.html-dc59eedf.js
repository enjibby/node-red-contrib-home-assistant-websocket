import{_ as r,r as t,o as i,c as s,a as e,b as a,d as n,e as c}from"./app-f4d6e414.js";const h={},l=e("h1",{id:"fire-event",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#fire-event","aria-hidden":"true"},"#"),a(" Fire Event")],-1),p=e("p",null,"Fire an event to Home Assistants event bus",-1),u=e("h2",{id:"configuration",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#configuration","aria-hidden":"true"},"#"),a(" Configuration")],-1),f={id:"event",tabindex:"-1"},v=e("a",{class:"header-anchor",href:"#event","aria-hidden":"true"},"#",-1),_=c('<ul><li>Type: <code>string</code></li></ul><p>Event name to fire</p><h3 id="data" tabindex="-1"><a class="header-anchor" href="#data" aria-hidden="true">#</a> data</h3><ul><li>Type: <code>Object</code></li></ul><p>JSON object to pass along</p><h2 id="inputs" tabindex="-1"><a class="header-anchor" href="#inputs" aria-hidden="true">#</a> Inputs</h2><p>If the incoming message has a <code>payload</code> property with <code>event</code> set it will override any config values if set. If the incoming message has a <code>payload.data</code> that is an object or parsable into an object these properties will be <strong>merged</strong> with any config values set. If the node has a property value in its config for <code>Merge Context</code> then the <code>flow</code> and <code>global</code> contexts will be checked for this property which should be an object that will also be merged into the data payload.</p><h3 id="payload-event" tabindex="-1"><a class="header-anchor" href="#payload-event" aria-hidden="true">#</a> payload.event</h3><ul><li>Type: <code>string</code></li></ul><p>Event to fire</p><h3 id="payload-data" tabindex="-1"><a class="header-anchor" href="#payload-data" aria-hidden="true">#</a> payload.data</h3><ul><li>Type: <code>Object</code></li></ul><p>Event data to send</p><h2 id="outputs" tabindex="-1"><a class="header-anchor" href="#outputs" aria-hidden="true">#</a> Outputs</h2><h3 id="payload-event-type" tabindex="-1"><a class="header-anchor" href="#payload-event-type" aria-hidden="true">#</a> payload.event_type</h3><ul><li>Type: <code>string</code></li></ul><p>Event Type that was fired</p><h3 id="payload-data-1" tabindex="-1"><a class="header-anchor" href="#payload-data-1" aria-hidden="true">#</a> payload.data</h3><ul><li>Type: <code>Object</code></li></ul><p>The event <code>data</code> sent if one was used</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>',21),y={href:"https://developers.home-assistant.io/docs/en/dev_101_events.html#firing-events",target:"_blank",rel:"noopener noreferrer"};function b(g,m){const o=t("Badge"),d=t("ExternalLinkIcon");return i(),s("div",null,[l,p,u,e("h3",f,[v,a(" Event "),n(o,{text:"required"})]),_,e("p",null,[e("a",y,[a("Home Assistant Events"),n(d)])])])}const E=r(h,[["render",b],["__file","fire-event.html.vue"]]);export{E as default};
