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
  innerWidth: number;
  innerHeight: number;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
      this.http.get('./assets/data.json').subscribe(data => {
        var days = data['days'];
        this.days = parseInt(days);
        var max = data['max'];
        this.max = parseInt(max);
        this.results = data['results'];
        this.innerWidth = window.innerWidth;
        this.innerHeight = window.innerHeight;
        this.drawGraph(this.results);
      });   
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.innerWidth = event.target.innerWidth; 
    this.innerHeight = event.target.innerHeight; 
    if (this.results !== undefined) {
      this.drawGraph(this.results);
    }
  }

  drawGraph(data: string[]): void {
    var ratio = this.max / (this.days);
    var border = Math.round(0.1 * Math.max(this.innerHeight, this.innerWidth));
    var width = this.innerWidth - border;
    var height = this.innerHeight - border;

    var factorX = Math.floor(Math.max(1, width / (this.days -1)));
    var sumData = 0; // float
    for (var i = 0; i < data.length; i++) {
      sumData = sumData + parseFloat(data[i]);
    }
    var maxInDataOrMaxCONST = Math.max(this.max, sumData);
    var factorY = Math.floor(Math.max(1, height / maxInDataOrMaxCONST));

    var canvas = this.getHiDpiContext(width + border, height + border);
    var context = canvas.getContext("2d", {alpha: false});

    var startX = Math.round(0.5 * border);
    var startY = Math.round(0.5 * border + height);
    var targetX = Math.round(0.5 * border + (this.days - 1) * factorX);
    var targetY = Math.round(0.5 * border + height - (this.max * factorY));
    //  var startY = height - (ratio * factorY);
    // x-axis
    context.beginPath();
    context.moveTo(startX, startY);
    context.strokeStyle = 'grey';
    context.lineTo(targetX, startY);
    context.stroke();
    // y-axis
    context.beginPath();
    context.moveTo(startX, startY);
    context.strokeStyle = 'grey';
    context.lineTo(startX, targetY);
    context.stroke();
    // target line
    context.beginPath();
    context.moveTo(startX, Math.round(startY - (ratio * factorY)));
    context.lineTo(targetX, targetY);    
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();

    // values 
    var x = startX;
    var y = startY;
    var sum = '0'; // float
    for (var i = 0; i < data.length; i++) {
      context.beginPath();    
      context.moveTo(x, y);
      sum = (parseFloat(sum) + parseFloat(data[i])).toString();
      var toX = startX + Math.round(i * factorX);
      var toY = startY - (Math.round(parseFloat(sum)) * factorY);
      context.lineTo(toX, toY);
      context.lineWidth = 2;
      if (parseFloat(sum) > (i+1 * ratio)){
        context.strokeStyle = 'red';
      } else {
        context.strokeStyle = 'green';
      }
      context.stroke();
      x = toX; 
      y = toY;  
    }
    var remaining = Math.floor(this.max - parseFloat(sum));
    var perDay = Math.round(remaining / (this.days - (length)) * 100)/100;

    // dotted line to target
    context.beginPath();
    context.setLineDash([5, 15]);
    context.moveTo(x, y);
    context.lineTo(targetX, targetY);
    context.stroke();
    context.setLineDash([]); // reset

    // display
    context.beginPath();
    var size = Math.max(10, Math.round(Math.max(factorY/2, factorX/2)));
    context.lineWidth = size;
    var totalDegrees = (this.max - remaining)/this.max * 2 * Math.PI;
    context.arc(2 * border, border, Math.round(0.25 * border), totalDegrees, 2 * Math.PI);
    context.stroke();
    // display description
    context.beginPath();
    context.fillStyle = 'black';
    context.font = size + 'pt Helvetica, sans-serif';
    var totalText: string = '' + (Math.round(remaining*100)/100);
    if (remaining > 0) {
      context.fillStyle = 'green';
      totalText += '@' + perDay;
    } else {
      context.fillStyle = 'red';
    }
    context.fillText(totalText, Math.round(2.5 * border), Math.round(1.08 * border);    
    context.stroke();
    // TODO this.saveCanvas(canvas); // http://weworkweplay.com/play/saving-html5-canvas-as-image/
  }

  saveCanvas(canvas): void{
    var dataURL = canvas.toDataURL('image/png');
    // TODO upload service
  }

  getHiDpiContext(width: number, height: number): HTMLCanvasElement {
    var ratio = this.getRatio();
    var canvas =  <HTMLCanvasElement> document.getElementById("canvas");
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);

    return canvas;
  }

  getRatio(): number {
    var dpr = window.devicePixelRatio || 1;

    return dpr;
  }

}