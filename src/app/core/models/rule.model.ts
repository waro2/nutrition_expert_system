export interface Condition {
    var: string;
    op: string;
    val: any;
}

export interface Action {
    type: string;
    msg: string;
    ruleId?: string;
    priority?: number;
}

export interface Rule {
    id: string;
    when: Condition[];
    then: Action[];
    priority: number;
    tags?: string[];
}