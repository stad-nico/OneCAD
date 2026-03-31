# Angular Style Guide

This document outlines the Angular-specific coding standards and best practices for the OpenTSCAD project. These guidelines ensure consistency, performance, and maintainability across all Angular components.

## Core Principles

- **Performance First**: Always use OnPush change detection
- **Modern Angular**: Leverage latest Angular features (signals, control flow syntax)
- **Type Safety**: Strict typing with Maybe<T> pattern
- **Explicit Visibility**: All class members must have visibility modifiers

## Component Architecture

### Change Detection Strategy

**Always use OnPush change detection for every component:**

```typescript
@Component({
  selector: 'app-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class ExampleComponent {
  // ...
}
```

**Why**: OnPush dramatically improves performance by only checking for changes when:
- Input properties change
- Event is triggered
- Observable emits
- Signals update

### Signals vs Getters

**Prefer computed signals over getters or simple methods:**

```typescript
// ❌ Bad - getter recalculates on every change detection
get filteredItems() {
  return this.items().filter(item => item.active);
}

// ❌ Bad - method call in template creates new function each time
getFilteredItems() {
  return this.items().filter(item => item.active);
}

// ✅ Good - computed signal caches result until dependencies change
readonly filteredItems = computed(() => 
  this.items().filter(item => item.active)
);
```

**Usage in template:**
```html
<!-- Use computed signal directly -->
@for (item of filteredItems(); track item.id) {
  <div>{{ item.name }}</div>
}
```

### Input and Output Properties

**Always prefer signal inputs and outputs over legacy decorators:**

```typescript
// ❌ Bad - legacy input/output
@Component({
  // ...
})
export class LegacyComponent {
  @Input() data: string = '';
  @Output() dataChange = new EventEmitter<string>();
}

// ✅ Good - signal inputs/outputs
@Component({
  // ...
})
export class ModernComponent {
  // Signal input with default value
  readonly data = input<string>('');
  
  // Signal input with transformation
  readonly count = input(0, {
    transform: (value: string | number) => Number(value)
  });
  
  // Required signal input
  readonly id = input.required<string>();
  
  // Signal output
  readonly dataChange = output<string>();
  
  // Signal output with custom name
  readonly valueChanged = output<number>({ alias: 'valueChange' });
}
```

### Control Flow Syntax

**Use Angular's new control flow syntax instead of structural directives:**

```typescript
// ❌ Bad - old structural directives
@Component({
  template: `
    <div *ngIf="user; else loading">
      <h2>{{ user.name }}</h2>
      <ul>
        <li *ngFor="let item of items; trackBy: trackById">
          {{ item.name }}
        </li>
      </ul>
    </div>
    <ng-template #loading>
      <div>Loading...</div>
    </ng-template>
  `
})

// ✅ Good - new control flow syntax
@Component({
  template: `
    @if (user(); as currentUser) {
      <h2>{{ currentUser.name }}</h2>
      <ul>
        @for (item of items(); track item.id) {
          <li>{{ item.name }}</li>
        } @empty {
          <li>No items available</li>
        }
      </ul>
    } @else {
      <div>Loading...</div>
    }
  `
})
```

**Control flow syntax benefits:**
- Better type inference
- Cleaner template syntax
- Built-in empty states with `@empty`
- Better IDE support

## Type System

### Maybe<T> Pattern

**Always use Maybe<T> instead of union with null:**

```typescript
// ❌ Bad - union with null
private user: User | null = null;
private data: string | null = null;

// ✅ Good - Maybe<T> pattern
private user: Maybe<User> = undefined;
private data: Maybe<string> = undefined;

// In type definitions (ensure Maybe<T> is defined)
type Maybe<T> = T | undefined;
```

**Benefits:**
- Consistent nullability pattern
- Better integration with Angular signals
- Clearer intent in type definitions

### Signal Type Patterns

```typescript
@Component({
  // ...
})
export class ExampleComponent {
  // Simple signal
  private readonly count = signal(0);
  
  // Signal with Maybe type
  private readonly selectedItem = signal<Maybe<Item>>(undefined);
  
  // Signal with complex type
  private readonly formData = signal<{
    name: string;
    email: string;
    isValid: boolean;
  }>({
    name: '',
    email: '',
    isValid: false
  });
  
  // Computed signal
  readonly isFormValid = computed(() => {
    const data = this.formData();
    return data.name.length > 0 && data.email.includes('@');
  });
}
```

## Class Member Visibility

**Every class member must have explicit visibility modifiers:**

```typescript
@Component({
  // ...
})
export class ExampleComponent implements OnInit {
  // ✅ Public - accessible from template
  public readonly title = 'Example Component';
  
  // ✅ Protected - accessible from template and subclasses
  protected readonly items = signal<Array<Item>>([]);
  
  // ✅ Private - internal component logic only
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(ApiService);
  
  // Signal inputs (always readonly)
  public readonly config = input.required<ComponentConfig>();
  
  // Signal outputs
  public readonly itemSelected = output<Item>();
  
  // Computed signals (always readonly)
  public readonly filteredItems = computed(() => 
    this.items().filter(item => item.active)
  );
  
  public ngOnInit(): void {
    this.loadData();
  }
  
  protected onItemClick(item: Item): void {
    this.itemSelected.emit(item);
  }
  
  private loadData(): void {
    this.apiService.getItems()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(items => this.items.set(items));
  }
}
```

**Visibility Guidelines:**
- `public`: Template-accessible properties and public API methods
- `protected`: Template-accessible properties in base components, subclass methods
- `private`: Internal component logic, injected services, private computations

## Component Lifecycle

### Modern Lifecycle Patterns

```typescript
@Component({
  // ...
})
export class ModernComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(ApiService);
  
  // Signal for component state
  private readonly isLoading = signal(false);
  public readonly data = signal<Maybe<ComponentData>>(undefined);
  
  public ngOnInit(): void {
    this.initializeComponent();
  }
  
  private initializeComponent(): void {
    this.loadInitialData();
    this.setupSubscriptions();
  }
  
  private loadInitialData(): void {
    this.isLoading.set(true);
    
    this.apiService.getData()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: data => this.data.set(data),
        error: error => this.handleError(error)
      });
  }
  
  private setupSubscriptions(): void {
    // Use effect for reactive logic
    effect(() => {
      const currentData = this.data();
      if (currentData) {
        this.processData(currentData);
      }
    });
  }
  
  private handleError(error: unknown): void {
    console.error('Component error:', error);
    // Handle error appropriately
  }
  
  private processData(data: ComponentData): void {
    // Process data logic
  }
}
```

### Dependency Injection

```typescript
@Component({
  // ...
})
export class ServiceConsumerComponent {
  // ✅ Use inject() function (modern approach)
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  
  // ✅ For optional services
  private readonly analyticsService = inject(AnalyticsService, { optional: true });
  
  // ❌ Avoid constructor injection for new components
  // constructor(
  //   private httpClient: HttpClient,
  //   private router: Router
  // ) {}
}
```

## Template Patterns

### Event Handling

```html
<!-- ✅ Good - clear event handlers -->
<button 
  type="button"
  (click)="onSubmit()"
  [disabled]="isLoading()">
  Submit
</button>

<!-- ✅ Good - with parameters -->
<div 
  @for (item of items(); track item.id) {
    <button 
      type="button"
      (click)="onItemSelect(item)">
      {{ item.name }}
    </button>
  }
</div>
```

### Property Binding

```html
<!-- ✅ Good - signal binding -->
<div [class.active]="isActive()">
  Content
</div>

<!-- ✅ Good - computed property -->
<div [style.opacity]="opacity()">
  {{ content() }}
</div>

<!-- ✅ Good - conditional classes with signals -->
<div [class]="computedClasses()">
  Dynamic styling
</div>
```

### Template Reference Variables

```html
<!-- ✅ Good - template references for form controls -->
<input 
  #searchInput
  type="text"
  placeholder="Search..."
  (input)="onSearch(searchInput.value)">

<!-- ✅ Good - with ViewChild for component interaction -->
<app-child-component 
  #childRef
  [data]="childData()">
</app-child-component>
```

## Performance Best Practices

### TrackBy Functions

```typescript
@Component({
  // ...
})
export class ListComponent {
  public readonly items = signal<Array<ListItem>>([]);
  
  // ✅ TrackBy is automatic with new control flow and track expression
  // No need for separate trackBy methods
}
```

```html
<!-- ✅ New control flow automatically optimizes -->
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}
```

### OnPush Optimization

```typescript
@Component({
  selector: 'app-optimized',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data(); as currentData) {
      <div>{{ currentData.title }}</div>
      @for (item of currentData.items; track item.id) {
        <app-item [item]="item" (itemChange)="onItemChange($event)"></app-item>
      }
    }
  `
})
export class OptimizedComponent {
  public readonly data = input.required<ComponentData>();
  public readonly itemChanged = output<ItemChangeEvent>();
  
  protected onItemChange(event: ItemChangeEvent): void {
    this.itemChanged.emit(event);
  }
}
```

## Testing Patterns

### Component Testing

```typescript
describe('ModernComponent', () => {
  let component: ModernComponent;
  let fixture: ComponentFixture<ModernComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModernComponent],
      providers: [
        provideHttpClientTesting(),
        // ... other providers
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ModernComponent);
    component = fixture.componentInstance;
  });
  
  it('should create component', () => {
    expect(component).toBeTruthy();
  });
  
  it('should handle signal input changes', () => {
    // Set signal input
    fixture.componentRef.setInput('data', 'test-data');
    fixture.detectChanges();
    
    expect(component.data()).toBe('test-data');
  });
  
  it('should emit output events', () => {
    let emittedValue: Maybe<string> = undefined;
    
    // Subscribe to signal output
    component.dataChange.subscribe(value => {
      emittedValue = value;
    });
    
    // Trigger the event
    component.triggerDataChange('new-value');
    
    expect(emittedValue).toBe('new-value');
  });
});
```

## Migration Checklist

When updating existing components to follow this style guide:

### ✅ Change Detection
- [ ] Add `ChangeDetectionStrategy.OnPush` to all components
- [ ] Verify template still updates correctly with OnPush

### ✅ Control Flow
- [ ] Replace `*ngIf` with `@if`
- [ ] Replace `*ngFor` with `@for` and `track`
- [ ] Replace `*ngSwitch` with `@switch`
- [ ] Add `@empty` blocks where appropriate

### ✅ Signals
- [ ] Convert `@Input()` to `input()` or `input.required()`
- [ ] Convert `@Output()` to `output()`
- [ ] Replace getters with `computed()`
- [ ] Replace BehaviorSubject with `signal()` where appropriate

### ✅ Types
- [ ] Replace `| null` with `Maybe<T>` pattern
- [ ] Ensure `Maybe<T>` type is imported

### ✅ Visibility
- [ ] Add visibility modifiers to all class members
- [ ] Use most restrictive visibility possible
- [ ] Make computed signals and inputs `readonly`

### ✅ Modern Patterns
- [ ] Use `inject()` instead of constructor injection
- [ ] Use `takeUntilDestroyed()` instead of manual unsubscribe
- [ ] Use `effect()` for reactive side effects

## File Organization

```
component-name/
├── component-name.component.ts     # Main component class
├── component-name.component.html   # Template
├── component-name.component.scss   # Styles
├── component-name.component.spec.ts # Tests
└── index.ts                       # Barrel export (if needed)
```

## Import Organization

```typescript
// Angular core imports
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Angular common imports
import { CommonModule } from '@angular/common';

// Third-party imports
import { Observable } from 'rxjs';

// Project imports
import { Maybe } from '../../shared/types';
import { ApiService } from '../../core/services';
import { ComponentData, ItemChangeEvent } from '../types';
```

This style guide ensures consistent, performant, and maintainable Angular code throughout the OpenTSCAD project.