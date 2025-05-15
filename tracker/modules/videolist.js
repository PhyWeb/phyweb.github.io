const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
--------------------------------------------VIDEOLIST-------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class VIDEOLIST {
  constructor() {
    this.list;

  }
  loadXHR(_url, _type, _callback){
    let xhr = new XMLHttpRequest;
    xhr.onload = function () {
      _callback(this.response);
    };
    xhr.responseType = _type;
    xhr.open('GET', _url);
    xhr.send(null);
  }

  init(_url){
    this.loadXHR(_url, "text", _response => {
      // Parse JSON
      this.list = JSON.parse(_response);
      //console.log("videolist loaded", this.list);

      // Create DOM elements
      // Iterate titles
      for(let el0 of this.list.videos){
        let p = document.createElement("p");
        p.classList.add("menu-label");
        p.innerHTML = el0.title;
        $("#video-list").appendChild(p);

        let ul = document.createElement("ul");
        ul.classList.add("menu-list");

        // Iterate elements of the title
        for(let el1 of el0.elements){

          let li = this.createIconText(el1)
          ul.appendChild(li);
          if(el1.type == "folder"){
            let ul2 = document.createElement("ul");
            ul2.classList.add("is-hidden"); // initially closed
            for(let el2 of el1.videos){
              let li2 = this.createIconText(el2)
              ul2.appendChild(li2);
            }
            
            li.appendChild(ul2);
          }
          if(el1.type == "video"){
            // TODO
          }

        }
        $("#video-list").appendChild(ul);
      }
    });
  }

  createIconText(_el){
    let li = document.createElement("li");
    let i = document.createElement("i");
    let a = document.createElement("a");
    i.classList.add("fa-solid")
    if(_el.type == "folder"){
      i.classList.add("fa-folder-open");
      a.classList.add("has-text-weight-bold");

      a.addEventListener("click", ()=>{
        if(a.nextSibling.classList.contains("is-hidden")){
          a.nextSibling.classList.remove("is-hidden");
        } else{
          a.nextSibling.classList.add("is-hidden");
        }
      });
    } else {
      i.classList.add("fa-film");

      a.addEventListener("click", ()=>{
        $("#open-video").disabled = false;

        document.querySelectorAll(".video-item").forEach((e)=>{
          e.classList.remove("is-active");
        });

        a.classList.add("is-active");

        $("#video-thumbnail").src = "assets/" + _el.thumb;
        $("#video-description").innerHTML = _el.description;
      });
    }

    let span = document.createElement("span");
    span.classList.add("icon")
    let span2 = document.createElement("span");
    span.appendChild(i);
    span2.append(" " + _el.title);

    
    a.appendChild(span);
    a.appendChild(span2);
    a.classList.add("icon-text")
    a.classList.add("video-item")
    a.dataset.path = _el.path;

    li.appendChild(a);

    return li;
  }
}