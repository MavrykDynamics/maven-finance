# Mavryk Indexer Helm Chart

## Updating the DEV/PROD indexer

1. Build and push a new image of the indexer. The documentation about the deployment is inside de **Indexer** subfolder [here](../../../indexer/README.md).
2. `kubens mavryk-finance-indexer` to switch to the namespace where the indexer is installed. (you can do a `kubectl get po` to see all dipdup/hasura instances running)
3. Open the right \*.values.yaml file
   - _PROD_: prod.values.yaml
   - _DEV_: dev.values.yaml
4. In it, replace the value in:
   - `dipdup.image.tag` to the tag of your last pushed image on dockerhub
5. `helm dependency update` to catch the local dependencies needed to generate the final manifest.
6. Generate the final manifest depending on the environment you want to update:
   - `helm template prod . --values prod.values.yaml --namespace mavryk-indexer > temp.yaml`
7. ~~`kubectl apply -f ./temp.yaml` to apply the manifest. The ressources should be updating.~~ Use ArgoCD (ask the DevOps).
8. _(optional)_ `kubectl get po` to see the pod creation in progress
9. _(optional)_ `kubectl describe po [POD_NAME]` to see the current state of the pod and its error messages if it failed on creation
10. _(optional)_ `kubectl logs [POD_NAME] -f` to read the pod logs in real-time. In this case, it is primarly used to track the indexing progress of the indexer and see if it finished indexing or not.
