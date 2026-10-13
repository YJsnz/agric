// A user-selected detection record constrains the tool call, even if the model
// omits its optional argument. Authentication and farm isolation stay in Java.
export function scopeToolArgs(name,args,question) {
  if(name==='query_crop_knowledge'){
    const crops=[['wheat',/小麦|旱碱麦/],['jujube',/小枣|金丝.*枣/],['vegetable',/青县|番茄|黄瓜/],['pear',/鸭梨|梨叶|泊头/]].filter(([,pattern])=>pattern.test(question)).map(([crop])=>crop);
    if(crops.length===1)return {...args,crop:crops[0]};
  }
  const ids=question.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi)||[];
  return name==='get_vision_records'&&ids.length===1?{...args,recordId:ids[0]}:args;
}
