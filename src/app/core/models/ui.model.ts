import { Fact } from './fact.model';
import { Action } from './inference.model';

export interface FormField {
    key: keyof Fact;
    label: string;
    type: 'number' | 'select' | 'toggle';
    options?: { value: number; label: string }[];
    min?: number;
    max?: number;
    required?: boolean;
}

export interface ActionGroup {
    type: string;
    typeLabel: string;
    actions: Action[];
    priority: number;
}