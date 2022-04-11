import { Game } from "../Game/Game";

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

export type ComponentType = "RigidBodyComponent" | "VelocityComponent";

export class IComponent {
    static nextId : number;
};

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
/* CUSTOM COMPONENTS */
class RigidBodyComponent extends Component {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(...args: number[]){

        super();
        this.x = args[0]
        this.y = args[1];
        this.width = args[2];
        this.height = args[3];
    };
}


class VelocityComponent extends Component {

    xVelocity: number;
    yVelocity: number;

    constructor(xVelocity: number, yVelocity: number) {
        super();
        this.xVelocity = xVelocity;
        this.yVelocity = yVelocity;
    }
}

/* END OF CUSTOM COMPONENTS */

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

    public SetIndice(indice: number , component : T ) {
        this.data[indice] = component;
    }


};

class ISystem {
    constructor(){}
}

export class System{
    protected entities : Entity[] = [];
    private componentSignature: boolean[] = []; // What components the system is interested in
    constructor() {
    }

    public AddEntityToSystem(entity : Entity) : void {
        this.entities.push(entity);
    }

    public RequireComponent(componentType: ComponentType) : void {

        if(Registry.componentMap[componentType] === undefined ) {
            Registry.componentMap[componentType] = Registry.numberOfComponents++;
        }

        let componentId : number = Registry.componentMap[componentType] as number;
        
        this.componentSignature[componentId] = true;
    }

    public GetComponentSignature() : boolean[] {
        return this.componentSignature;
    }
    
};

export type SystemTypes = "RenderSystem" | "VelocitySystem";



export class Registry {
    // 1st array = component Id
    // 2nd array = entity Id
    private componentPools : any[] = [];  // Vector of component pools, each pool contains all the data for a certain compoenent type

    // 1st index = entity id
    // 2nd is for each component that could exist and if the entity is still interested in it
    private entityComponentSignature : boolean[][] = []; // keeps track of which entity is on for a given entity. An array of boolean arrays

    static componentMap: any = new Object(); // k = name of class, v = id

    static numberOfComponents: number = 0;

    private numberOfEntities : number = 0;

    private entitiesToAdd : Entity[] = [];

    public systems : any[] = [];

    static systemMap: any = new Object();

    
    constructor() {}

    public AddComponent<TComponent, TArgs>(componentType : ComponentType, entity : Entity, ...args : TArgs[] ) : void {

        const componentExists = Registry.componentMap[componentType];

        if(componentExists === undefined) {
            Registry.componentMap[componentType] = Registry.numberOfComponents++;
        }



        const componentId : number  = Registry.componentMap[componentType] as number;
        const entityId = entity.GetId();


        // Now lets go through the componentPool and make a componentPool if one does not already exist
        if(!this.componentPools[componentId])  {    // if componentPool does not exist
            const newComponentPool : Pool<TComponent> = new Pool();
            this.componentPools[componentId] = newComponentPool;
        }

        // Now, let's create a new component and put it into that place

        let instance: TComponent = eval(`new ${componentType}(${args})`);       // Really bad practice for prod env but for fun this is acceptable

        this.componentPools[componentId].SetIndice(entityId, instance);

        // // Now lets set the eneityComponentSignature
        if(this.entityComponentSignature.length <= entityId ) {
            this.entityComponentSignature.length = entityId + 1;
        }

        if(!this.entityComponentSignature[entityId]) {
            const boolArr: boolean[] = new Array<boolean>();
            this.entityComponentSignature[entityId] = boolArr;
        }

        if(this.entityComponentSignature[entityId].length <= componentId) {
            this.entityComponentSignature[entityId].length = componentId + 1;
        }

        this.entityComponentSignature[entityId][componentId] = true;
        
        Registry.numberOfComponents++;

    }

    public CreateEntity() : Entity {

        const entity = new Entity(this.numberOfEntities++, this);
        this.entitiesToAdd.push(entity);
        return entity;
    }

    public AddEntitiesToSystem(): void {
        // Imagine this is a stack data structure, LIFO
        if(this.entitiesToAdd.length > 0) {
            console.log("this.entitiesToAdd" , this.entitiesToAdd);

            for(let m = 0 ; m < this.entitiesToAdd.length; m++) {
                // entity 1
                // system 1
                const entityId = this.entitiesToAdd[m].GetId();
                for(let i = 0; i < this.systems.length; i++) {

                    const systemComponentSignature : boolean[] = this.systems[i].GetComponentSignature();
                    
                    // component signature of system 1
                    for(let j = 0; j < systemComponentSignature.length; j++) {

                        console.log("systemComponentSignature[j]" , systemComponentSignature[j] , " this.entityComponentSignature[j]" , this.entityComponentSignature[j]);
                        if(systemComponentSignature[j] === true && !this.entityComponentSignature[entityId][j]) {
                            // If a part of the system component signature was true yet the same corresponding part of the entity's component signature was false 
                            console.log("BREAK MOTHERFUCKA");
                            break;
                        }

                        // if at end of loop, loop has not yet broken
                        if(j === systemComponentSignature.length - 1) {
                            // console.log("this is the systmem: ", this.systems[i], " and this is the entity: " , this.entitiesToAdd[m]);
                            this.systems[i].AddEntityToSystem(this.entitiesToAdd[m]);
                        }
                        
                    }

                    // If nothing was out of line, then this was successful and add the entity to the system
                }
            }
        }


        this.entitiesToAdd = [];
        
    }

    

    public AddSystem (systemType : string ) : void {

        const system = eval(`new ${systemType}()`);


        this.systems.push(system);
        if(!Registry.systemMap[systemType] ) {

            const indice = this.systems.length - 1;

            Registry.systemMap[systemType] = indice;
        }
    }


    public UpdateSystems() : void {
        for(let i = 0; i < this.systems.length; i++) {
            this.systems[i].Update();
        }
    }

    public GetComponent(componentType: ComponentType , entityId : number) : Component  {

        const componentId : number = Registry.componentMap[componentType];

        const componentPool : Pool<ComponentType> = this.componentPools[componentId] as Pool<ComponentType>;

        const component  = componentPool.GetIndice(entityId) as Component;

        return component;

    }


    public GetSystem(systemType : SystemTypes) : any {
        const systemId: number = Registry.systemMap[systemType];

        const system : System = this.systems[systemId];

        return system;
    }
    


}

/* CUSTOM SYSTEM SECTION */

class RenderSystem extends System {

    constructor() {
        super();
        this.RequireComponent("RigidBodyComponent");
    }

    public Update(canvas : HTMLCanvasElement) : void {

        
        if(canvas) {
            this.entities.forEach((entity) => {
                
                const rigidBodyComponent : RigidBodyComponent = entity.registry.GetComponent("RigidBodyComponent", entity.GetId()) as RigidBodyComponent;
                const ctx : CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
                
                const height = rigidBodyComponent.height as unknown as number;
                const width = rigidBodyComponent.width as unknown as number;
                const x = rigidBodyComponent.x as unknown as number;
                const y = rigidBodyComponent.y as unknown as number;
                
                // this.drawSquare(ctx,x,y,width,height);
                this.drawCircle(ctx, x,y, 10);
                

            });
        }

    }

    private drawSquare(
        ctx : CanvasRenderingContext2D,  
        x : number,
        y : number, 
        width : number,
        height : number
    ) : void {
        ctx.moveTo(x,y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width , y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    private drawCircle(
        ctx:CanvasRenderingContext2D,
        x: number, 
        y: number,
        radius: number) : void {
            ctx.beginPath();
            ctx.arc(x,y,radius,0, 2 * Math.PI);
            ctx.stroke();
        }


}

class VelocitySystem extends System {
    
    constructor() {
        super();
        this.RequireComponent("VelocityComponent");
    }


    public Update() {
        console.log("entities: " , this.entities);
        this.entities.forEach((entity) => {
            
            const entityId = entity.GetId();
            const velocityComponent: VelocityComponent = entity.registry.GetComponent("VelocityComponent", entityId) as VelocityComponent;
            let rigidBodyComponent : RigidBodyComponent = entity.registry.GetComponent("RigidBodyComponent", entityId) as RigidBodyComponent;

            rigidBodyComponent.x += velocityComponent.xVelocity;
            rigidBodyComponent.y += velocityComponent.yVelocity;

        })
    }
}

/* END OF SYSTEM SECTION */