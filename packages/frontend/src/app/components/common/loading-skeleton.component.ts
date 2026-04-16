import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3 p-4">
      @for (item of [1, 2, 3]; track item) {
        <div class="animate-pulse space-y-2">
          <div class="h-4 bg-slate-700 rounded w-3/4"></div>
          <div class="h-3 bg-slate-800 rounded w-1/2"></div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSkeletonComponent {}
