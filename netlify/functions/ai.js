exports.handler = async function(event) {
  try {
    var body = JSON.parse(event.body || "{}");
    var loc = body.location || "Paris";
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: "Return ONLY valid JSON with places array. Each: {name,cat(0=restaurants 1=attractions 2=entertainment 3=transit 4=shopping),desc(Hebrew 10 words),tip(Hebrew 8 words),img(https://source.unsplash.com/400x200/?KEYWORD)}. 3 per category=15 total.",
        messages: [{role:"user",content:"3 places per category in "+loc+". Hebrew desc and tip."}]
      })
    });
    var data = await res.json();
    var text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
    var parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
    return { statusCode:200, headers:{"Access-Control-Allow-Origin":"*","Content-Type":"application/json"}, body:JSON.stringify(parsed) };
  } catch(e) {
    return { statusCode:500, headers:{"Access-Control-Allow-Origin":"*","Content-Type":"application/json"}, body:JSON.stringify({error:e.message,places:[]}) };
  }
};
