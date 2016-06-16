var DB = {
   
  init: function() {
  	
  },

  save: function(key, data)
  {
    if(this.isJSON(data))
    {
      data = JSON.stringify(data);
    }
    localStorage.setItem(key,data);
  },

  get: function(key, default_value)
  {
    ret = localStorage.getItem(key);
    if(ret === 'undefined'){
      if(!default_value){
        return "";
      } else {
        return default_value;
      }
    }
    if(this.isJSON(ret))
    {
      ret = JSON.parse(ret);
    }
    return ret ? ret : default_value;
  },
  isJSON: function(val)
  {
    try {
        if(val == undefined) throw 'undefined';
        JSON.stringify(val);
        return true;
    } catch (ex) {
        return false;
    }
  }
  
};
