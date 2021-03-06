function Interface()
{
  this.el = document.createElement("div");
  this.el.id = "interface";

  this.el.appendChild(this.menu_el = document.createElement("div"));
  this.menu_el.id = "menu";

  this.is_visible = true;
  this.zoom = false;

  this.start = function()
  {
    document.getElementById("app").appendChild(this.el);
    this.el.appendChild(dotgrid.picker.el);
    
    var html = ""
    var options = {
      cast:{
        line: { key:"A",icon:"M60,60 L240,240" },
        arc_c: { key:"S",icon:"M60,60 A180,180 0 0,1 240,240" },
        arc_r: { key:"D",icon:"M60,60 A180,180 0 0,0 240,240" },
        bezier: { key:"F",icon:"M60,60 Q60,150 150,150 Q240,150 240,240" },
        close: { key:"Z",icon:"M60,60 A180,180 0 0,1 240,240  M60,60 A180,180 0 0,0 240,240" }
      },
      toggle:{
        linecap: { key:"Q",icon:"M60,60 L60,60 L180,180 L240,180 L240,240 L180,240 L180,180" },
        linejoin: { key:"W",icon:"M60,60 L120,120 L180,120  M120,180 L180,180 L240,240" },
        thickness: { key:"",icon:"M120,90 L120,90 L90,120 L180,210 L210,180 Z M105,105 L105,105 L60,60 M195,195 L195,195 L240,240" }, 
        mirror: { key:"E",icon:"M60,60 L60,60 L120,120 M180,180 L180,180 L240,240 M210,90 L210,90 L180,120 M120,180 L120,180 L90,210" },
        fill: { key:"F",icon:"M60,60 L60,150 L150,150 L240,150 L240,240 Z" }
      },
      misc:{
        color: { key:"G",icon:"M150,60 A90,90 0 0,1 240,150 A-90,90 0 0,1 150,240 A-90,-90 0 0,1 60,150 A90,-90 0 0,1 150,60"}
      },
      source:{
        open: { key:"", icon:"M155,65 A90,90 0 0,1 245,155 A90,90 0 0,1 155,245 A90,90 0 0,1 65,155 A90,90 0 0,1 155,65 M155,95 A60,60 0 0,1 215,155 A60,60 0 0,1 155,215 A60,60 0 0,1 95,155 A60,60 0 0,1 155,95 "},
        render: { key:"", icon:"M155,65 A90,90 0 0,1 245,155 A90,90 0 0,1 155,245 A90,90 0 0,1 65,155 A90,90 0 0,1 155,65 M110,155 L110,155 L200,155 "},
        export: { key:"", icon:"M155,65 A90,90 0 0,1 245,155 A90,90 0 0,1 155,245 A90,90 0 0,1 65,155 A90,90 0 0,1 155,65 M110,140 L110,140 L200,140 M110,170 L110,170 L200,170"},
        save: { key:"", icon:"M155,65 A90,90 0 0,1 245,155 A90,90 0 0,1 155,245 A90,90 0 0,1 65,155 A90,90 0 0,1 155,65 M110,155 L110,155 L200,155 M110,185 L110,185 L200,185 M110,125 L110,125 L200,125"},
        grid: { key:"H", icon:"M95,95 L95,95 L95,95 M125,95 L125,95 L125,95 M155,95 L155,95 L155,95 M185,95 L185,95 L185,95 M215,95 L215,95 L215,95 M95,125 L95,125 L95,125 M125,125 L125,125 L125,125 M155,125 L155,125 L155,125 M185,125 L185,125 L185,125 M215,125 L215,125 L215,125 M95,155 L95,155 L95,155 M125,155 L125,155 L125,155 M155,155 L155,155 L155,155 M185,155 L185,155 L185,155 M215,155 L215,155 L215,155 M95,185 L95,185 L95,185 M125,185 L125,185 L125,185 M155,185 L155,185 L155,185 M185,185 L185,185 L185,185 M215,185 L215,185 L215,185 M95,215 L95,215 L95,215 M125,215 L125,215 L125,215 M155,215 L155,215 L155,215 M185,215 L185,215 L185,215 M215,215 L215,215 L215,215 "},
      }      
    }

    for(type in options){
      var tools = options[type];
      for(name in tools){
        var tool = tools[name];
        html += `
        <svg 
          id="option_${name}" 
          title="${name.capitalize()}" 
          onmouseout="dotgrid.interface.out('${type}','${name}')" 
          onmouseup="dotgrid.interface.up('${type}','${name}')" 
          onmouseover="dotgrid.interface.over('${type}','${name}')" 
          viewBox="0 0 300 300" 
          class="icon ${type}">
          <path id="${name}_path" class="icon_path" d="${tool.icon}"/>${name == "depth" ? `<path class="icon_path inactive" d=""/>` : ""}
          <rect ar="${name}" width="300" height="300" opacity="0">
            <title>${name.capitalize()}${tool.key ? '('+tool.key+')' : ''}</title>
          </rect>
        </svg>`
      }
      
    }
    this.menu_el.innerHTML = html
  }

  this.over = function(type,name)
  {
    dotgrid.cursor.operation = {}
    dotgrid.cursor.operation[type] = name;
  }

  this.out = function(type,name)
  {
    dotgrid.cursor.operation = ""
  }

  this.up = function(type,name)
  {
    if(!dotgrid.tool[type]){ console.warn(`Unknown option(type): ${type}.${name}`,dotgrid.tool); return; }

    dotgrid.tool[type](name)
    this.refresh();
  }

  this.prev_operation = null;

  this.refresh = function(force = false,id)
  {
    if(this.prev_operation == dotgrid.cursor.operation && force == false){ return; }

    var multi_vertices = null;
    var segments = dotgrid.tool.layer()
    var sum_segments = dotgrid.tool.length();

    for(id in segments){
      if(segments[id].vertices.length > 2){ multi_vertices = true; break; }
    }

    document.getElementById("option_line").className.baseVal = !dotgrid.tool.can_cast("line") ? "icon inactive" : "icon";
    document.getElementById("option_arc_c").className.baseVal = !dotgrid.tool.can_cast("arc_c") ? "icon inactive" : "icon";
    document.getElementById("option_arc_r").className.baseVal = !dotgrid.tool.can_cast("arc_r") ? "icon inactive" : "icon";
    document.getElementById("option_bezier").className.baseVal = !dotgrid.tool.can_cast("bezier") ? "icon inactive" : "icon";
    document.getElementById("option_close").className.baseVal = !dotgrid.tool.can_cast("close") ? "icon inactive" : "icon";
    
    document.getElementById("option_thickness").className.baseVal = dotgrid.tool.layer().length < 1 ? "icon inactive" : "icon";
    document.getElementById("option_linecap").className.baseVal = dotgrid.tool.layer().length < 1 ? "icon inactive" : "icon";
    document.getElementById("option_linejoin").className.baseVal = dotgrid.tool.layer().length < 1 || !multi_vertices ? "icon inactive" : "icon";
    document.getElementById("option_mirror").className.baseVal = dotgrid.tool.layer().length < 1 ? "icon inactive" : "icon";
    document.getElementById("option_fill").className.baseVal = dotgrid.tool.layer().length < 1 ? "icon inactive" : "icon";
    
    document.getElementById("option_color").children[0].style.fill = dotgrid.tool.style().color;
    document.getElementById("option_color").children[0].style.stroke = dotgrid.tool.style().color;
    document.getElementById("option_color").className.baseVal = "icon";

    // Source

    document.getElementById("option_save").className.baseVal = sum_segments < 1 ? "icon inactive source" : "icon source";
    document.getElementById("option_export").className.baseVal = sum_segments < 1 ? "icon inactive source" : "icon source";
    document.getElementById("option_render").className.baseVal = sum_segments < 1 ? "icon inactive source" : "icon source";

    document.getElementById("option_grid").className.baseVal = !dotgrid.guide.show_extras ? "icon inactive source" : "icon source";
    
    // Mirror
    if(dotgrid.tool.style().mirror_style == 0){ document.getElementById("mirror_path").setAttribute("d","M60,60 L60,60 L120,120 M180,180 L180,180 L240,240 M210,90 L210,90 L180,120 M120,180 L120,180 L90,210") }
    else if(dotgrid.tool.style().mirror_style == 1){ document.getElementById("mirror_path").setAttribute("d","M60,60 L240,240 M180,120 L210,90 M120,180 L90,210") }
    else if(dotgrid.tool.style().mirror_style == 2){ document.getElementById("mirror_path").setAttribute("d","M210,90 L210,90 L90,210 M60,60 L60,60 L120,120 M180,180 L180,180 L240,240") }
    else if(dotgrid.tool.style().mirror_style == 3){ document.getElementById("mirror_path").setAttribute("d","M60,60 L60,60 L120,120 L120,120 L180,120 M120,150 L120,150 L180,150 M120,180 L120,180 L180,180 L180,180 L240,240 ") }
    else if(dotgrid.tool.style().mirror_style == 4){ document.getElementById("mirror_path").setAttribute("d","M120,120 L120,120 L120,120 L180,120 M120,150 L120,150 L180,150 M120,180 L120,180 L180,180 L180,180 L180,180 L240,240 M120,210 L120,210 L180,210 M120,90 L120,90 L180,90 M60,60 L60,60 L120,120  ") }

    this.prev_operation = dotgrid.cursor.operation;
  }

  this.toggle = function()
  {
    this.is_visible = this.is_visible ? false : true;
    this.el.className = this.is_visible ? "visible" : "hidden";
  }
}
