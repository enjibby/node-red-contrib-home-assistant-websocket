import{_ as l,r as o,o as c,c as s,a as e,b as t,d as i,w as r,e as n}from"./app-f4d6e414.js";const h={},u=e("h1",{id:"wait-until",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#wait-until","aria-hidden":"true"},"#"),t(" Wait Until")],-1),p=e("p",null,"When an input is received the node will wait until the condition is met or the timeout occurs then will pass on the last received message. Any new input will reset the timeout timer.",-1),_=e("h2",{id:"configuration",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#configuration","aria-hidden":"true"},"#"),t(" Configuration")],-1),f={id:"entity-id",tabindex:"-1"},m=e("a",{class:"header-anchor",href:"#entity-id","aria-hidden":"true"},"#",-1),y=e("li",null,[t("Type: "),e("code",null,"string")],-1),g=e("p",null,"The id of an entity to use for the comparison.",-1),b=e("p",null,[t("Custom ids can be inserted into the list by adding a "),e("code",null,"#"),t(" at the end of the id")],-1),w={id:"entity-id-filter-types",tabindex:"-1"},x=e("a",{class:"header-anchor",href:"#entity-id-filter-types","aria-hidden":"true"},"#",-1),v=e("ul",null,[e("li",null,[t("Type: "),e("code",null,"string")]),e("li",null,[t("Values: "),e("code",null,"exact|list|substring|regex")]),e("li",null,[t("Default: "),e("code",null,"exact")])],-1),T={id:"wait-until-1",tabindex:"-1"},k=e("a",{class:"header-anchor",href:"#wait-until-1","aria-hidden":"true"},"#",-1),I=n('<ul><li>Type: <code>string</code></li></ul><p>The <code>property</code> field will be checked against the <code>value</code> field using the comparator.</p><h3 id="timeout" tabindex="-1"><a class="header-anchor" href="#timeout" aria-hidden="true">#</a> Timeout</h3><ul><li>Type: <code>number</code></li></ul><p>The amount of time to wait for the condition to become true before deactivating the node and passing the message object to the second output. If the timeout is equal to zero the node will wait indefinitely for the condition to be met.</p><h3 id="entity-location" tabindex="-1"><a class="header-anchor" href="#entity-location" aria-hidden="true">#</a> Entity Location</h3><ul><li>Type: <code>string</code></li></ul><p>The entity object can also be passed with the message object.</p><h3 id="check-against-the-current-state" tabindex="-1"><a class="header-anchor" href="#check-against-the-current-state" aria-hidden="true">#</a> Check against the current state</h3><ul><li>Type: <code>boolean</code></li></ul><p>When an input is received it will check the comparator against the current state instead of waiting for a state change.</p><h2 id="input" tabindex="-1"><a class="header-anchor" href="#input" aria-hidden="true">#</a> Input</h2><h3 id="reset" tabindex="-1"><a class="header-anchor" href="#reset" aria-hidden="true">#</a> reset</h3><p>If the received message has this property set to any value the node will be set to inactive and the timeout cleared.</p><h3 id="payload" tabindex="-1"><a class="header-anchor" href="#payload" aria-hidden="true">#</a> payload</h3><ul><li>Type: <code>object</code></li></ul><p>Override config values by passing in a property with a valid value.</p>',17),C=e("li",null,[e("code",null,"entity_id")],-1),B=e("code",null,"entityId",-1),L=n("<li><code>entityIdFilterType</code></li><li><code>property</code></li><li><code>comparator</code></li><li><code>value</code></li><li><code>valueType</code></li><li><code>timeout</code></li><li><code>timeoutUnits</code></li><li><code>entityLocation</code></li><li><code>entityLocationType</code></li><li><code>checkCurrentState</code></li>",10),V=e("h2",{id:"output",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#output","aria-hidden":"true"},"#"),t(" Output")],-1),W=e("p",null,"Will output the last received message when the condition is true or the timeout occurs. If the condition becomes true the message will be passed to the first output. If the timeout passes the message will be sent to the second output.",-1);function j(q,E){const a=o("Badge"),d=o("RouterLink");return c(),s("div",null,[u,p,_,e("h3",f,[m,t(" Entity ID "),i(a,{text:"required"})]),e("ul",null,[y,e("li",null,[t("Accepts "),i(d,{to:"/guide/mustache-templates.html"},{default:r(()=>[t("Mustache Templates")]),_:1})])]),g,b,e("h3",w,[x,t(" Entity ID Filter Types "),i(a,{text:"required"})]),v,e("h3",T,[k,t(" Wait Until "),i(a,{text:"required"})]),I,e("ul",null,[C,e("li",null,[B,t(),i(a,{type:"warning",text:"deprecated"})]),L]),V,W])}const U=l(h,[["render",j],["__file","wait-until.html.vue"]]);export{U as default};
