const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
--------------------------------------------VIDEOLIST-------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class VIDEOLIST {
  constructor(player) {
    this.player = player;
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
      this.list = JSON.parse(_response);
      console.log("videolist loaded", this.list);
      for(let video of this.list.videos){
        let i = document.createElement("i");
        i.classList.add("fas", "fa-film", "fa-fw");
        let span = document.createElement("span");
        span.innerHTML = " " + video.title;

        let div = document.createElement("div");
        div.classList.add("videoListItem", "button2");
        div.appendChild(i);
        div.appendChild(span);

        div.addEventListener("click", ()=> {
          console.log(video.path)
          this.player.load("assets/"+ video.path,()=>{});
        });

        $(".videoList").appendChild(div);
      }
    });
  }
}