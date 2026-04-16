import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (error()) {
      <div class="bg-red-900/30 border border-red-700 rounded-lg p-4 space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-red-400 text-lg">⚠️</span>
          <h3 class="font-semibold text-red-300">Error</h3>
        </div>
        <p class="text-red-200 text-sm">{{ error() }}</p>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDisplayComponent {
  /**
   * The error message to display.
   */
  public readonly error = input<string | null>(null);
}
