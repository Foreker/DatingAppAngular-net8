import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-delete-button',
  imports: [],
  templateUrl: './delete-button.component.html',
  styleUrl: './delete-button.component.css'
})
export class DeleteButtonComponent {
  disabled = input<boolean>();
  clickEvent = output<Event>();

  onClick(event: Event) {
    this.clickEvent.emit(event);
  }
}
