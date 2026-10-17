  // Only decode this card's former [value, field-description] encoding.
  // Lists are walked against their declared templates, never mistaken for scalars.
  function normalizeLegacyState(state){
    let changed=false;
    const descriptions=new Map(ShrineFieldSpec.map(row=>[row.path,row.说明]));
    function visit(value,expected,path){
      if(Array.isArray(expected)){
        if(!Array.isArray(value))return value;
        const rows=value.filter(item=>{
          const metadata=item&&typeof item==='object'&&!Array.isArray(item)&&item.$arrayMeta===true&&item.$meta&&typeof item.$meta==='object';
          if(metadata)changed=true;
          return !metadata;
        });
        return rows.map(item=>Object.hasOwn(ShrineTemplates,path)?visit(item,ShrineTemplates[path],path+'.*'):item);
      }
      if(expected&&typeof expected==='object'){
        if(!value||typeof value!=='object'||Array.isArray(value))return value;
        const result={...value};
        for(const [key,template] of Object.entries(expected))if(Object.hasOwn(value,key))result[key]=visit(value[key],template,path?path+'.'+key:key);
        return result;
      }
      if(Array.isArray(value)&&value.length===2&&typeof value[0]===typeof expected&&typeof value[1]==='string'&&value[1]===descriptions.get(path)){
        changed=true;
        return value[0];
      }
      return value;
    }
    let result=visit(clone(state),ShrineInitial,'');
    if(!Object.hasOwn(result,'衣橱')){result=normalizeWardrobeUpgrade(result);changed=true;}
    // Fail closed: a partial/foreign/otherwise corrupt save is never filled with defaults.
    checkFields(result);
    validateWardrobeHistory(result);
    return {state:result,changed};
  }
