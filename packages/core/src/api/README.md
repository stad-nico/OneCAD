All api functions build operation lists instead of calling the kernel directly.
Only when we triangulate, we call the worker with the operation list 
who then actually executes the operations. 