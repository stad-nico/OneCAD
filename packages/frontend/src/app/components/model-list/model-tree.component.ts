import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EvaluationStep } from '../../../worker/types';

@Component({
  selector: 'app-model-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2">
      @for (step of steps(); track step.id) {
        <button
          [class.bg-blue-600]="isSelected(step.id)"
          [class.hover:bg-blue-700]="isSelected(step.id)"
          [class.border-blue-400]="isSelected(step.id)"
          [class.bg-slate-800]="!isSelected(step.id)"
          [class.border-slate-700]="!isSelected(step.id)"
          [class.hover:bg-slate-700]="!isSelected(step.id)"
          [class.hover:border-slate-600]="!isSelected(step.id)"
          (click)="stepSelected.emit(step)"
          [style.margin-left.rem]="step.depth"
          class="w-full px-4 py-2 rounded-lg transition-all duration-200 text-slate-100 border text-left text-sm hover:shadow-md"
        >
          <span class="font-medium">{{ step.label }}</span>
          <span class="text-xs text-slate-400 ml-2">#{{ step.id.substring(0, 8) }}</span>
        </button>
      }

      @if (steps().length === 0) {
        <div class="text-center py-4 text-slate-400">
          <p class="text-xs">No intermediate steps</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelTreeComponent {
  /**
   * The evaluation steps to display.
   */
  public readonly steps = input.required<EvaluationStep[]>();

  /**
   * The ID of the currently selected step.
   */
  public readonly selectedStepId = input<string | null>(null);

  /**
   * Emitted when a step is selected.
   */
  public readonly stepSelected = output<EvaluationStep>();

  /**
   * Check if a step is currently selected.
   */
  public isSelected(stepId: string): boolean {
    return this.selectedStepId() === stepId;
  }
}
