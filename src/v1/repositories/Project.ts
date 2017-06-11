export default class Project {
    static _projects = [
        {
            "name": "SprintGame",
            "description": "Mobile game for students"
        },
        {
            "name": "TAMK Events",
            "description": "Mobile app and event management system"
        }
    ];

    static getAll() {
        return this._projects;
    }

    static create(project) {
        this._projects.push(project);
    }
}
