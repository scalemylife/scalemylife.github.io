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
    context.moveTo(startPoint, window.innerHeight);

    console.log(startPoint);
    
    var sum = '0'; // float
    for (var x = 0; x < data.length; x++) {
      sum = (parseFloat(sum) + parseFloat(data[x])).toString();
      var y = height - Math.round(parseFloat(sum) * factorY);
      context.lineTo(startPoint + Math.round(x * factorX), y);
    }
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();
    // today line
    context.beginPath();
    var todayWithFactor = Math.max(0, Math.round((data.length-1) * factorX));
    var todayY = height - Math.round(parseFloat(sum) * factorY);
    context.moveTo(startPoint + todayWithFactor, height);
    var fontSize = Math.max(1, Math.round(Math.min(factorY / 2, factorX))); // TODO refactor global
    context.lineTo(startPoint + todayWithFactor, Math.max(todayY, height - Math.round(2 * startPoint)));
    if (parseFloat(sum) > (data.length * ratio)){
      context.lineWidth = 2;
      context.strokeStyle = 'red';
    } else {
      context.strokeStyle = 'green';
    }
    context.stroke();
      // target line
    context.beginPath();
    context.moveTo(startPoint, height);
    context.lineTo(startPoint + Math.round(this.days * factorX), 0);    
    context.lineWidth = 2;
    context.stroke();
    // description
    context.beginPath();
    context.fillStyle = 'black';
    context.font = fontSize + 'em Helvetica, sans-serif';
    this.total = Math.floor(this.max - parseFloat(sum));
    this.perDay = Math.floor(this.total / (this.days - (data.length)));
    var text = sum + '/' + data.length * ratio;
    context.fillText(text, startPoint, Math.max(todayY, height - Math.round(2 * startPoint)));
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