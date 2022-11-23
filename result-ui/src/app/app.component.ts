import { Component } from '@angular/core';
import io from 'socket.io-client';

// Helper function calculating vote repartition
const getPercentages = (a: number, b: number) => {
  const result = {
    a: 0,
    b: 0,
  };

  if (a + b > 0) {
    result.a = Math.round((a / (a + b)) * 100);
    result.b = 100 - result.a;
  } else {
    result.b = 50;
    result.a = result.b;
  }

  return result;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export default class AppComponent {
  private socket: any;

  public socketMessage = '';

  public opacity = '';

  public aPercent = '50%';

  public bPercent = '50%';

  public total = 0;

  constructor() {
    this.socket = io('', {
      path: '/socket.io',
    });

    // Change something on the UI to indicate new message received
    this.socket.on('message', ({ text }: { text: string }) => {
      this.socketMessage = text;
      this.opacity = '0.6';
    });

    // Update scores when a new vote is received
    this.socket.on('scores', (json: any) => {
      this.opacity = '1';

      // Extract number of votes for each item (a / b)
      const data: { a: number, b: number } = JSON.parse(json);
      const a = parseInt(String(data.a || 0), 10);
      const b = parseInt(String(data.b || 0), 10);

      // Get percentage of votes for each item
      const percentages = getPercentages(a, b);

      // Setting those props that should be used to move left/right the vertical slider on the UI
      this.aPercent = `${percentages.a}%`;
      this.bPercent = `${percentages.b}%`;

      // Setting this prop to indicate the total number of votes
      this.total = a + b;
    });
  }
}
