
export class Sockets {

  constructor(config) {
    this.connect()

    this.listenners = {}
  }

  emit(type, data) {
    console.log('emit ddd')
    this.ws.send(JSON.stringify({ type: type, data : data }));
  }

  on(type, func) {
    if (!this.listenners[type]) {
      this.listenners[type] = []
    }
    this.listenners[type].push(func)
  }

  dispatch(type, data) {
    (this.listenners[type] || []).map((func) => {
      func(data)
    })

  }

  connect() {
    this.ws = new WebSocket('ws://192.168.2.125:8121');

    this.ws.onopen = () => {
      this.onopen && this.onopen()


    };

    this.ws.onmessage = (e) => {
      try {
        //this.onmessage && this.onmessage(JSON.stringify(e))
        let d = JSON.parse(e.data)
        this.dispatch(d.type, d.data)
      } catch (e) {
        console.log('Error on parse message')
      }
    };

    this.ws.onerror = (e) => {
      this.onerror && this.onerror(e)

      setTimeout(() => {
        this.connect()
      }, 2000)

      // an error occurred
      console.log(e.message);
    };
  }

}
