import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ProjectManagerComponent } from '../project-manager/project-manager.component';
import { ModelVisualizerComponent } from '../model-visualizer/model-visualizer.component';

type Maybe<T> = T | undefined;

/**
 * Main view component that combines project management with model visualization
 * This serves as the primary interface for the multi-project OpenTSCAD application
 */
@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ProjectManagerComponent, ModelVisualizerComponent]
})
export class MainViewComponent {
  // Injected services
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  
  // Route parameters
  public readonly projectId = signal<Maybe<string>>(undefined);
  public readonly modelId = signal<Maybe<string>>(undefined);
  
  // UI state
  public readonly isProjectManagerVisible = signal(true);
  
  // Computed properties
  public readonly currentView = computed(() => {
    const projectId = this.projectId();
    const modelId = this.modelId();
    
    if (projectId && modelId) {
      return 'model';
    }
    
    if (projectId) {
      return 'project';
    }
    
    return 'default';
  });
  
  public readonly pageTitle = computed(() => {
    const view = this.currentView();
    const projectId = this.projectId();
    const modelId = this.modelId();
    
    if (view === 'model') {
      return `${modelId} - ${projectId}`;
    }
    
    if (view === 'project') {
      return projectId || 'Project';
    }
    
    return 'OpenTSCAD - Multi-Project CAD Environment';
  });
  
  public readonly showBreadcrumb = computed(() => this.currentView() !== 'default');
  
  public readonly showDefaultMessage = computed(() => {
    const view = this.currentView();
    return view === 'default' || view === 'project';
  });
  
  public readonly isDefaultView = computed(() => this.currentView() === 'default');
  public readonly isProjectView = computed(() => this.currentView() === 'project');
  public readonly isModelView = computed(() => this.currentView() === 'model');
  
  public constructor() {
    // Set up route parameter tracking
    effect(() => {
      this.route.paramMap.subscribe(params => {
        this.projectId.set(params.get('projectId') || undefined);
        this.modelId.set(params.get('modelId') || undefined);
      });
    });
  }
  
  /**
   * Toggles the project manager panel visibility
   */
  public toggleProjectManager(): void {
    this.isProjectManagerVisible.update(visible => !visible);
  }
  
  /**
   * Handles navigation to home
   */
  public navigateToHome(): void {
    this.router.navigate(['/']);
  }
  
  /**
   * Handles navigation to a specific project
   */
  public navigateToProject(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }
  
  /**
   * Handles navigation to a specific model
   */
  public navigateToModel(projectId: string, modelId: string): void {
    this.router.navigate(['/projects', projectId, 'models', modelId]);
  }
  
  /**
   * Handles navigation back to project view
   */
  public navigateToProjectView(): void {
    const projectId = this.projectId();
    if (projectId) {
      this.router.navigate(['/projects', projectId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}