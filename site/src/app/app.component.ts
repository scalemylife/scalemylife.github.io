import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  days: number;
  max: number;

  // TODO https://stackoverflow.com/questions/18839048/how-to-read-a-file-in-angularjs
  dataProvider() {
    var data = [
      '0',
      '23.99'
    ]; 

    return data;
  }

  constructor() {
    this.days = 22;
    this.max = 220;
  }

  ngOnInit() {
    this.drawGraph();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
   this.drawGraph();
  }

  drawGraph() {
    var ratio = this.max / this.days;
    var data = this.dataProvider();
    var width = window.innerWidth;
    var height = window.innerHeight - document.body.offsetHeight;
    var factorX = Math.floor(width / Math.max(this.days, data.length));
    var maxInDataOrMaxCONST = Math.max(this.max, Math.max.apply(Math, data));
    var factorY = Math.floor(Math.max(1, height / maxInDataOrMaxCONST));

    var context = this.getHiDpiContext(width, height);
    context.beginPath();
    context.moveTo(0, window.innerHeight);
    
    var sum = '0'; // float
    for (var x = 0; x < data.length; x++) {
      sum = (parseFloat(sum) + parseFloat(data[x])).toString();
      var y = height - Math.round(parseFloat(sum) * factorY);
      context.lineTo(Math.round(x * factorX), y);
    }
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();
    // today line
    context.beginPath();
    var todayWithFactor = Math.max(0, Math.round((data.length-1) * factorX));
    var todayY = height - Math.round(parseFloat(sum) * factorY);
    context.moveTo(todayWithFactor, height);
    context.lineTo(todayWithFactor, todayY);
    if (parseFloat(sum) > (data.length * ratio)){
      context.lineWidth = 2;
      context.strokeStyle = 'red';
    } else {
      context.strokeStyle = 'green';
    }
    context.stroke();
      // target line
    context.beginPath();
    context.moveTo(0, height);
    context.lineTo(Math.round(this.days * factorX), 0);    
    context.lineWidth = 2;
    context.stroke();
    // description
    context.beginPath();
    context.fillStyle = 'black';
    var fontSize = Math.max(10, Math.min(factorY, factorX)); // TODO refactor global
    context.font = fontSize + 'px Helvetica, sans-serif';
    context.fillText(sum + ' von ' + data.length * ratio, todayWithFactor, Math.round(Math.max(2 * fontSize, todayY - 2 * fontSize)));
    context.font = 2 * fontSize + 'px Helvetica, sans-serif';
    var total = this.max - parseFloat(sum);
    var perDay = Math.floor(total / (this.days - (data.length)));
    context.fillText(total + ' ~ ' + perDay + ' pD', 2 * fontSize, 2 * fontSize);
    context.stroke();
  }

  getHiDpiContext(width: number, height: number) {
    var ratio = this.getRatio();
    var canvas =  <HTMLCanvasElement> document.getElementById("canvas");
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);

    return canvas.getContext("2d", {alpha: false});
  }

  getRatio() {
    var dpr = window.devicePixelRatio || 1;

    return dpr;
  }

}