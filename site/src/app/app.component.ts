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
    // TODO refactor factorY
    var factorY = Math.floor(Math.max(1, height / maxInDataOrMaxCONST));

    var canvas = this.getHiDpiContext(width, height);
    var context = canvas.getContext("2d", {alpha: false});
    context.beginPath();
    context.moveTo(startPoint, height);
    var sum = '0'; // float
    for (var i = 0; i < data.length; i++) {
      sum = (parseFloat(sum) + parseFloat(data[i])).toString();
      var x = startPoint + Math.round(i * factorX);
      var y = height - (Math.round(parseFloat(sum)) * factorY);
      context.lineTo(x, y);
    }
    this.total = Math.floor(this.max - parseFloat(sum));
    this.perDay = Math.round(this.total / (this.days - (data.length)) * 100)/100;

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

    // target line
    context.beginPath();
    var startY = height - (ratio * factorY);
    context.moveTo(startPoint, startY);
    var x = startPoint + Math.round(this.days * factorX);
    var y = height - (Math.round(ratio * this.days) * factorY);
    context.lineTo(x, y);    
    context.lineWidth = 2;
    context.strokeStyle = 'green';
    context.stroke();

    // total description
    context.beginPath();
    context.fillStyle = 'black';
    var fontSize = Math.max(1, Math.round(Math.min(factorY / 2, factorX)));
    context.font = fontSize + 'em Helvetica, sans-serif';
    var totalText = '' + (Math.round(this.total*100)/100);
    context.fillStyle = 'green';
    context.fillText(totalText + '@' + this.perDay, 1.9 * startPoint, 1 * startPoint);
    context.stroke();

    // this.saveCanvas(canvas);
  }

  saveCanvas(canvas) {
    var dataURL = canvas.toDataURL('image/png');
    // TODO upload service
  }

  getHiDpiContext(width: number, height: number) {
    var ratio = this.getRatio();
    var canvas =  <HTMLCanvasElement> document.getElementById("canvas");
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);

    return canvas;
  }

  getRatio() {
    var dpr = window.devicePixelRatio || 1;

    return dpr;
  }

}