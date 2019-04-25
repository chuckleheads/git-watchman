import { IHttpClientResponse } from 'typed-rest-client/Interfaces';
export declare function startBuild(repo: string, owner: string, issue: string, branch: string): Promise<IHttpClientResponse>;
export declare function pollForMasterStatus(url: string, context: any): Promise<string>;
