import"./modulepreload-polyfill.b7f2da20.js";const p="https://api.v2.fxhash.xyz/v1/graphql";function f(t){var a,r,i;let n=(r=(a=t==null?void 0:t.wallet)==null?void 0:a.account)==null?void 0:r.username;return n&&n.trim().length>0?(n.length>32&&(n=`${n.substr(0,Math.floor(32*.5-3))}...${n.substr(n.length-Math.floor(32*.5-3),Math.floor(32*.5-3))}`),n):((i=t==null?void 0:t.wallet)==null?void 0:i.address)||"unknown"}function u(t){if(typeof(t==null?void 0:t.iteration)=="number")return t.iteration;if(t!=null&&t.name){const n=t.name.match(/#(\d+)/);if(n)return Number(n[1])}return null}async function g(t){var e,s,c,o,h,d;const n=`
		query TokensBySlug($slug: String!) {
			onchain {
				generative_token(where: { slug: { _eq: $slug } }) {
					id
					objkts(
						where: { assigned: { _eq: true } }
						order_by: { id: asc }
					) {
						id
						state
						generation_hash
						parent_hashes
						iteration
						depth
						name
						owner {
							wallet { address account { username } }
						}
					}
				}
			}
		}
	`,a={slug:t},r=await fetch(p,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({query:n,variables:a})});if(!r.ok)throw new Error("fxhash request failed");const i=await r.json();if((e=i==null?void 0:i.errors)!=null&&e.length)throw console.error("fxhash GraphQL errors:",i.errors),new Error("fxhash GraphQL returned errors");return(d=(h=(o=(c=(s=i==null?void 0:i.data)==null?void 0:s.onchain)==null?void 0:c.generative_token)==null?void 0:o[0])==null?void 0:h.objkts)!=null?d:[]}function m(t,n){function a(r,i){const l=f(r.owner),e=u(r);return`
			<div style="position:relative;padding:2px;font-size:10px;">
				<div style="position:relative;padding:2px;font-size:10px;margin-left:${Math.max(0,i)*4}px;">
					<div style="position:relative;display:block;">${e!==null?`|\u2014${e}`:r.name?r.name.toUpperCase():"./?"}:${l.toUpperCase()}</div>
				</div>
			</div>
			${r.children&&r.children.length?r.children.map(c=>a(c,i+1)).join(""):""}
		`}t.innerHTML=n.map(r=>`
		<div style="border:1px solid rgba(0,0,0,0.08);overflow:hidden;margin-top:8px;">
			${a(r,0)}
		</div>
	`).join("")}function y(t){function n(e,s){const c=u(e),o=u(s);return c==null&&o==null?0:c==null?1:o==null?-1:c-o}function a(e){e&&Array.isArray(e.children)&&e.children.length&&(e.children.sort(n),e.children.forEach(a))}const r=[];for(let e=0;e<t.length;e++){const s=t[e];s.state!=="REGENERATED"&&(s.children=[],r.push(s))}const i=new Map;for(let e=0;e<r.length;e++)i.set(r[e].generation_hash,r[e]);const l=[];for(let e=0;e<r.length;e++){const s=r[e];if((typeof s.depth=="number"?s.depth:0)>0){const o=Array.isArray(s.parent_hashes)?s.parent_hashes:[],h=o.length?o[o.length-1]:null,d=h?i.get(h):null;d?d.children.push(s):l.push(s)}else l.push(s)}return l.sort(n),l.forEach(a),{roots:l,byHash:i}}document.addEventListener("DOMContentLoaded",async()=>{const t=document.getElementById("mint-list");try{let n=await g("vertex-corrections");const{roots:a}=y(n);m(t,a)}catch(n){t.innerHTML='<div style="opacity:.7;">Failed to load mints.</div>',console.error(n)}});
