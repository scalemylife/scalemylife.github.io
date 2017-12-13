import { Component, HostListener } from '@angular/core';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  days: number;
  max: number;
  results: string[];
  perDay: number;
  total: number;

  constructor(private http: HttpClient) {
    this.days = 22;
    this.max = 220;

    this.perDay = 0;
    this.total = 0;
  }

  ngOnInit(): void {
      this.http.get('./assets/data.json').subscribe(data => {
        this.results = data['results'];
        this.drawGraph(this.results);
      });   
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.results !== undefined) {
      this.drawGraph(this.results);
    }
  }

  drawGraph(data: string[]) {

    var ratio = this.max / this.days;
    var startPoint = Math.round(0.1 * document.body.clientWidth);
    var width = window.innerWidth - startPoint;
    var height = window.innerHeight - startPoint;
    var factorX = Math.floor(width / Math.max(this.days, data.length));
    var maxInDataOrMaxCONST = Math.max(this.max, Math.max.apply(Math, data));
    var factorY = Math.floor(Math.max(1, height / maxInDataOrMaxCONST));

    var context = this.getHiDpiContext(width, height);
    context.beginPath();
    context.moveTo(startPoint, height);

    console.log(startPoint);
    
    var sum = '0'; // float
    for (var x = 0; x < data.length; x++) {
      sum = (parseFloat(sum) + parseFloat(data[x])).toString();
      var y = height - Math.round(parseFloat(sum) * factorY);
      context.lineTo(startPoint + Math.round(x * factorX), y);
    }
    this.total = Math.floor(this.max - parseFloat(sum));
    // this.perDay = Math.round(this.total / (this.days - (data.length)) * 100)/100;
    this.perDay = ratio * this.total/this.max;

    context.lineWidth = 2;
    if (parseFloat(sum) > (data.length * ratio)){
      context.strokeStyle = 'red';
    } else {
      context.strokeStyle = 'green';
    }
    context.stroke();

    // total summary
    context.beginPath();
    context.lineWidth = factorX;
    var totalDegrees = (this.max - this.total)/this.max * 2 * Math.PI;
    context.arc(startPoint, startPoint, Math.round(0.5 * startPoint), totalDegrees, 2 * Math.PI);
    context.stroke();

    // today line
    context.beginPath();
    var todayWithFactor = Math.max(0, Math.round((data.length-1) * factorX));
    var todayY = height - Math.round(parseFloat(sum) * factorY);
    var fontSize = Math.max(1, Math.round(Math.min(factorY / 2, factorX))); // TODO refactor global
    context.stroke();
    // target line
    context.beginPath();
    context.moveTo(startPoint, height);
    context.lineTo(startPoint + Math.round(this.days * factorX), height - Math.round(ratio * this.days * factorY));    
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();

    // total description
    // var todayTarget = data.length * ratio;
    // var today = (Math.trunc(parseFloat(sum) * 100)/100) ;
    context.beginPath();
    context.fillStyle = 'black';
    context.font = fontSize + 'em Helvetica, sans-serif';
    var totalText = '' + (Math.round(this.total*100)/100);
    context.fillText(totalText, 0.9 * startPoint, 0.9 * startPoint);
    var perDayText = (Math.round(this.perDay*100)/100) + '';
    context.fillText(perDayText, 0.9 * startPoint, 1.2 * startPoint);
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