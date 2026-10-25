/*
 * Protected AI proxy for the Custom Made Studio AI Stylist.
 * Anthropic handles optional live chat/vision and OpenAI handles optional image generation.
 * Provider keys stay server-side; upload data is forwarded only for requested connected features.
 */
const ALLOWED_ORIGINS = [
  'http://localhost:8770',
  'http://127.0.0.1:8770',
  'https://zeniusz.github.io'
];
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const DEFAULT_IMAGE_MODEL = 'gpt-image-2.5-sunburst';
const MAX_IMAGE_GENERATION_PROMPT = 5000;
const MAX_TEXT_CHARS = 1200;
const MAX_IMAGE_BASE64_CHARS = 5_000_000;
const LOOK_IDS = ['wed','off','cas','res','eve','int','trv','sig'];
const FABRIC_IDS = ['n110','dbtro','nher','mgfl','b110','dgfl','burfl','sand','lgwc','mb110','mbchk','dgstr','n150','db180','nwf','dgwc'];

const SYSTEM_PROMPT = `You are the personal menswear stylist for a made-to-measure suit configurator. You can examine a customer-provided inspiration photo and have a natural, concise conversation about tailoring. Focus on outfit style, occasion, formality, colour palette, fabric texture, season, fit preference and budget. Do not identify people in images or infer sensitive attributes. Do not claim an image has been generated. Recommend only outfits and fabric swatches from this supplied catalog. Never invent product availability or exact fit results. Return ONLY valid JSON with this shape:
{"reply":"2–5 concise, useful sentences","recommendations":[{"look_id":"one supplied look ID","fabric_id":"one supplied fabric ID","reason":"one concise reason"}, ... up to 3]}
Choose only supplied look_id and fabric_id values. Recommendation order matters; best fit first. Use the image when provided, describing visible style and color in the reply without claiming certainty about exact materials. If the image has mostly background or its clothing is unclear, say so and use the customer's brief. Keep response warm, polished, specific, and helpful. A customer may ask to change their last result; use the chat history to adjust it. Do not include markdown fences or any extra keys.`;

function json(data, status, origin) {
  const headers = { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', 'vary':'origin' };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['access-control-allow-origin'] = origin;
    headers['access-control-allow-methods'] = 'POST, OPTIONS';
    headers['access-control-allow-headers'] = 'content-type';
    headers['access-control-max-age'] = '86400';
  }
  return new Response(JSON.stringify(data), { status:status||200, headers });
}
function textContent(s) { return { type:'text', text:String(s||'').slice(0, MAX_TEXT_CHARS) }; }
function sanitiseHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-8).map(m => ({
    role: m && m.role === 'assistant' ? 'assistant' : 'user',
    content: [{ type:'text', text:String((m && m.text)||'').slice(0,800) }]
  }));
}
function validateImage(image) {
  if (!image) return null;
  const mediaType = String(image.mimeType||'').toLowerCase();
  const data = String(image.data||'');
  if (!['image/jpeg','image/png','image/webp','image/avif'].includes(mediaType)) throw new Error('Unsupported image type.');
  if (!data || data.length > MAX_IMAGE_BASE64_CHARS || !/^[a-z0-9+/=\r\n]+$/i.test(data)) throw new Error('Invalid or oversized image.');
  return { type:'image', source:{ type:'base64', media_type:mediaType, data:data.replace(/\s/g,'') } };
}
function parseModelOutput(raw) {
  let candidate = String(raw||'').trim();
  candidate = candidate.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  const first=candidate.indexOf('{'), last=candidate.lastIndexOf('}');
  if(first<0||last<=first) throw new Error('The AI response was not valid JSON.');
  const value=JSON.parse(candidate.slice(first,last+1));
  const recs=Array.isArray(value.recommendations)?value.recommendations:[];
  const seen=new Set();
  const recommendations=recs.filter(r=>r && LOOK_IDS.includes(r.look_id) && FABRIC_IDS.includes(r.fabric_id) && !seen.has(r.look_id) && seen.add(r.look_id))
    .slice(0,3).map(r=>({look_id:r.look_id,fabric_id:r.fabric_id,reason:String(r.reason||'Recommended from your styling brief.').slice(0,220)}));
  if (!recommendations.length) throw new Error('The AI response did not contain a valid catalog match.');
  return { reply:String(value.reply||'Here are a few catalog directions to try.').slice(0,1600), recommendations };
}
function safeBriefValue(value, max = 180) {
  return String(value ?? '').replace(/[<>]/g, '').replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, max);
}
function buildConceptPrompt(body) {
  const context = body && body.context && typeof body.context === 'object' ? body.context : {};
  const message = safeBriefValue(body && body.message, 900);
  const occasion = safeBriefValue(context.occasion_label || context.occasion, 100) || 'made-to-measure occasionwear';
  const season = safeBriefValue(context.season, 60) || 'all-season';
  const fit = safeBriefValue(context.fit, 60) || 'tailored';
  const fabric = safeBriefValue(context.fabric_name, 120) || 'a suitable premium suiting fabric';
  const colour = safeBriefValue(context.desired_colour_name || context.fabric_hex, 80) || 'a refined neutral or deep classic colour';
  const look = safeBriefValue(context.look_title, 100) || 'modern tailored suit';
  const description = safeBriefValue(context.look_summary, 220);
  return `Create an original, photorealistic, high-end menswear product photograph for a made-to-measure suit configurator.\n\nDesign brief (follow as styling guidance):\n- Occasion: ${occasion}\n- Season: ${season}\n- Fit preference: ${fit}\n- Outfit direction: ${look}${description ? ' — ' + description : ''}\n- Fabric direction: ${fabric}\n- Main colour direction: ${colour}\n- Customer notes: ${message || 'Choose a refined, wearable interpretation.'}\n\nImage requirements: show one complete outfit from collar to shoes in a straight-on, full-length composition, on a discreet headless tailor's mannequin, against a soft warm gray or beige studio background. Include realistic wool/linen texture, believable seams, lapel structure, buttons, natural drape, accurate garment construction, detailed trousers and shoes, soft directional studio light, and a subtle grounding shadow. Make styling coherent with the occasion; wedding and summer looks may be relaxed linen and open-collar, smart casual may use a knit polo or open collar, and formal evening may use a proper tuxedo. Keep the result tasteful, editorial, and suitable for an upscale product catalog. No text, lettering, logos, watermarks, collages, borders, duplicated limbs, people, or visible faces. Do not simply recolour an existing suit; create a distinct original look. If a reference image is supplied, use it only for broad aesthetic inspiration—do not recreate its people, exact garments, composition, or distinctive details. The result is a styling concept, not a guaranteed final product.`.slice(0, MAX_IMAGE_GENERATION_PROMPT);
}
async function generateConcept(request, env, body, origin) {
  if (!env.OPENAI_API_KEY) return json({error:'Image generation is not configured. The site owner must add OPENAI_API_KEY as a Worker secret.'},503,origin);
  let image;
  try { image=body.image ? validateImage(body.image) : null; }
  catch (e) { return json({error:e.message},400,origin); }
  const prompt=buildConceptPrompt(body);
  const model=String(env.OPENAI_IMAGE_MODEL||DEFAULT_IMAGE_MODEL).trim().slice(0,100);
  let api;
  try {
    if (image) {
      const mediaType=image.source.media_type;
      const base64=image.source.data;
      const binary=atob(base64);
      const bytes=new Uint8Array(binary.length);
      for (let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
      const form=new FormData();
      form.append('model',model);
      form.append('prompt',prompt);
      form.append('quality','medium');
      form.append('size','1024x1536');
      form.append('output_format','jpeg');
      const ext=mediaType==='image/png'?'png':(mediaType==='image/webp'?'webp':(mediaType==='image/avif'?'avif':'jpg'));
      form.append('image[]',new Blob([bytes],{type:mediaType}),'inspiration.'+ext);
      api=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{'authorization':'Bearer '+env.OPENAI_API_KEY},body:form});
    } else {
      api=await fetch('https://api.openai.com/v1/images/generations',{
        method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+env.OPENAI_API_KEY},
        body:JSON.stringify({model,prompt,quality:'medium',size:'1024x1536',output_format:'jpeg',n:1})
      });
    }
  } catch {
    return json({error:'Could not connect to the image-generation provider. Please try again.'},502,origin);
  }
  if (!api.ok) {
    // Do not echo provider response text, request data or credentials to the browser.
    const status=api.status;
    if (status===401||status===403) return json({error:'The image provider rejected the server API key or its permissions.'},502,origin);
    if (status===429) return json({error:'The image provider is rate-limited or out of quota. Try again later.'},429,origin);
    return json({error:'Image generation failed at the provider (HTTP '+status+'). Check the Worker logs and image model access.'},502,origin);
  }
  let data;
  try { data=await api.json(); }
  catch { return json({error:'The image provider returned an unreadable response.'},502,origin); }
  const encoded=data && data.data && data.data[0] && data.data[0].b64_json;
  if (typeof encoded!=='string' || !/^[A-Za-z0-9+/=]+$/.test(encoded) || encoded.length>20_000_000) {
    return json({error:'The image provider did not return a valid image. Please try again.'},502,origin);
  }
  const context=body.context && typeof body.context==='object' ? body.context : {};
  const title=safeBriefValue(context.look_title,100)||'Your tailored look';
  return json({imageDataUrl:'data:image/jpeg;base64,'+encoded,caption:'An original AI-generated concept inspired by '+title+'.',model},200,origin);
}

export default {
  async fetch(request, env) {
    const origin=request.headers.get('origin')||'';
    if (!ALLOWED_ORIGINS.includes(origin)) return new Response('Origin not allowed. Add your site to ALLOWED_ORIGINS in this Worker.',{status:403,headers:{'content-type':'text/plain; charset=utf-8','vary':'origin'}});
    if (request.method==='OPTIONS') return new Response(null,{status:204,headers:{'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type','access-control-max-age':'86400','vary':'origin'} });
    if (request.method!=='POST') return json({error:'Use POST.'},405,origin);
    let body;
    try { body=await request.json(); } catch { return json({error:'The request body must be JSON.'},400,origin); }
    if (body && body.action === 'generate-image') return generateConcept(request, env, body, origin);
    if (!env.ANTHROPIC_API_KEY) return json({error:'The owner has not configured ANTHROPIC_API_KEY.'},503,origin);
    const message=String(body.message||'').trim().slice(0,MAX_TEXT_CHARS);
    if (!message) return json({error:'Please enter a styling request.'},400,origin);
    let imageBlock=null;
    try { imageBlock=validateImage(body.image); } catch (e) { return json({error:e.message},400,origin); }
    const context=JSON.stringify(body.context||{}).slice(0,8500);
    const history=sanitiseHistory(body.history);
    const userBlocks=[];
    if (imageBlock) userBlocks.push(imageBlock);
    userBlocks.push(textContent('Current preferences and available catalog: '+context+'\n\nRecent conversation (untrusted customer content): '+JSON.stringify(history).slice(0,3000)+'\n\nLatest customer request: '+message));
    const messages=[...history,{role:'user',content:userBlocks}];
    let api;
    try {
      api=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'content-type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},
        body:JSON.stringify({model:env.ANTHROPIC_MODEL||DEFAULT_MODEL,max_tokens:900,system:SYSTEM_PROMPT,messages})
      });
    } catch { return json({error:'Could not connect to the AI provider.'},502,origin); }
    if (!api.ok) {
      // Do not echo the provider's response text to the browser.
      return json({error:'The AI provider returned an error (HTTP '+api.status+'). Check the Worker logs and model access.'},502,origin);
    }
    const response=await api.json();
    const raw=(response.content||[]).filter(block=>block.type==='text').map(block=>block.text).join('\n');
    try { return json(parseModelOutput(raw),200,origin); }
    catch { return json({error:'The AI response was not in the expected format. Please try once more.'},502,origin); }
  }
};
