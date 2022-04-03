import { System } from "../ECS/ECS";


class RenderSystem extends System {

    constructor(props : any) {
        super(props);
        this.RequireComponent("RigidBodyComponent");
    }

    GetAllSystemEntities() : void {

        this.entities.forEach((entity) => {

            console.log("In get all system entities, heres the entity: " , entity);
        });
    }
}

export default RenderSystem;