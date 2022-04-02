// import RigidBodyComponent from "../Components/RigidBodyComponent";

export type ComponentType = "RigidBodyComponent" | "VelocityComponent";

export class Entity {
    private id: number;
    public registry: Registry;
    constructor(id: number, registry: Registry){
        this.id = id;
        this.registry = registry;
    }

    public GetId(): number {
        return this.id;
    }

    public AddComponent<TComponent>( componentType : ComponentType ,  ...args: any[]): void {
        this.registry.AddComponent<TComponent, any>(componentType, this, args);
    }


};


export class IComponent {
    static nextId : number;
};



type GenericObject<T> = {
  
}

export class Component extends IComponent {
    public static id: number;
    constructor(...args : any ) {
        super();
        Component.id = IComponent.nextId++;
    }

    static GetId() : number {
        return Component.id;
    }
};

class RigidBodyComponent extends Component {
    x: number;
    y: number;
    constructor(...args: number[]){

        super();
        this.x = args[0]
        this.y = args[1];
    };
}
class IPool {
    
    constructor() {}
};

class Pool<T> extends IPool {

    private data: T[] = [];
    constructor() {
        super();
    }

    public GetIndice(indice : number) : T | void {
        try {
            return this.data[indice];
        } catch(e) {
            console.log("Pool - GetIndice Error: " , e);
            console.log("Possibly out of bounds. Length of data: " , this.data[indice]);
            console.log("The indice requested : " , indice);
        }
    }

    public Push( t : T ) : void {
        this.data.push(t);
    }


};

export class System {
    private entities : Entity[] = [];
    private componentSignature: boolean[] = []; // What components the system is interested in
    constructor() {}

    public AddEntityToSystem(entity : Entity) : void {
        this.entities.push(entity);
    }

    public RequireComponent(id : number) : void {
        this.componentSignature[id] = true;
    }

};



export class Registry {
    // 1st array = component Id
    // 2nd array = entity Id
    private componentPools : IPool[] = [];  // Vector of component pools, each pool contains all the data for a certain compoenent type

    // 1st index = entity id
    // 2nd is for each component that could exist and if the entity is still interested in it
    private entityComponentSignature : boolean[][] = []; // keeps track of which entity is on for a given entity. An array of boolean arrays

    private componentMap: Map<string, number> = new Map(); // k = name of class, v = id

    private numberOfComponents: number = 0;

    private numberOfEntities : number = 0;
    
    constructor() {}

    public AddComponent<TComponent extends Component, TArgs>(componentType : ComponentType, entity : Entity, ...args : TArgs[] ) : void {

        const componentExists = this.componentMap.has(componentType);

        console.log(componentExists);

        if(!componentExists) {
            console.log(this.componentMap.set(componentType, this.numberOfComponents));
        }

        const componentId  = this.componentMap.get(componentType) as number;

        const entityId = entity.GetId();

        // Now lets go through the componentPool and make a componentPool if one does not already exist
        if(!this.componentPools[componentId])  {    // if componentPool does not exist
            const newComponentPool : Pool<TComponent> = new Pool();
            this.componentPools[componentId] = newComponentPool;
        }

        // Now, let's create a new component and put it into that place

        let instance = eval(`new ${componentType}(${args})`);       // Really bad practice for prod env but for fun this is acceptable

        this.componentPools[componentId] = instance;

        // // Now lets set the eneityComponentSignature
        if(this.entityComponentSignature.length <= entityId ) {
            this.entityComponentSignature.length = entityId + 5;
            console.log("first if");
            console.log(this.entityComponentSignature);
        }

        if(!this.entityComponentSignature[entityId]) {
            const boolArr: boolean[] = new Array<boolean>();
            this.entityComponentSignature[entityId] = boolArr;
        }

        console.log(this.entityComponentSignature[entityId]);
        if(this.entityComponentSignature[entityId].length <= componentId) {
            this.entityComponentSignature[entityId].length = componentId + 5;
        }

        this.entityComponentSignature[entityId][componentId] = true;
        console.log(this.entityComponentSignature[entityId][componentId]);

    }

    public CreateEntity() : Entity {
        return new Entity(this.numberOfEntities++, this);
    }


}