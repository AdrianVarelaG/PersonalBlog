---
title: Agregar TLS a la instalación de Jenkins-x
date: "2020-03-08T19:00:00.000Z"
description: "En este post vamos a hablar acerca de como agregar TLS a la instalacion de jenkins-x"
---
Hola aragon. 
Bueno para empezar tenemos que definir por que esto podría no ser posible o difícil de logar de manera automática.

El soporte para TLS en Jenkins-x es solo para GKS y EKS ya que si nosotros lo intentamos instalar tenemos que ver que vamos a cambiar y entender que componente usa jenkins-x.

## Pre-requito 
Tener un cluster de kubernetes funcionando en algún cloud provider y jenkins-x instalado, yo utilizare Digital Ocean ya que es el que tengo disponible.

## Modificat archivo jx-requirements.yaml 
Para iniciar tenemos que cambiar la configuración para habilitar TLS en la llave de ingress tenemos que modificar.

* **domain:** nuestro dominio o sub dominio.
* **namespaceSubDomain:** para indicar que subDomain queremos utilizar en dev.
* **tls.email:** requisito de [Let's Encrypt](https://letsencrypt.org/) 
* **tls.enable:** true ya que lo queremos habilitar.
* **tls.production:** de momento lo dejamos en false ya que como estamos experimentando debemos usar el servidor de staging ya que el de producción tiene rate limits. 

```yaml
ingress:
  domain: apps.beethub.com.mx
  externalDNS: false
  namespaceSubDomain: dev.
  tls:
    email: contacto.beet@gmail.com
    enabled: true
    production: false
```
dentro de la el key de `environments.ingress` tenemos que hacer las mismas modificaciones en el ambiente de dev.
```yaml
environments:
- ingress:
    domain: apps.beethub.com.mx
    externalDNS: false
    namespaceSubDomain: dev.
    tls:
      email: contacto.beet@gmail.com
      enabled: true
      production: false
```
bueno llego el momento `jx boot --verbose` para que podamos ver en detalle lo que esta haciendo la instalación. Como era de esperarse hay un error.

### Análisis del error.

```
The Issuer "letsencrypt-staging" is invalid:
spec.acme.solvers.dns01 in body must be of type object: "null"'
```
Revisando el log me di cuenta de 2 cosas la primera es que copia desde `system/acme` hacia una carpeta temporal y después sustituye los valores, si vemos el archivo:

cert-manager-staging-issuer.yaml
```yaml
apiVersion: cert-manager.io/v1alpha2
kind: Issuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: "{{ .Values.certmanager.email }}"
    # Name of a secret used to store the ACME account private key
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - selector:
        dnsNames:
        - "*.{{ .Values.cluster.domain }}"
        - "{{ .Values.cluster.domain }}"
      # ACME DNS-01 provider configurations
      dns01:
{{- if eq .Values.cluster.provider "gke" }}
        clouddns:
          # The project in which to update the DNS zone
          project: "{{ .Values.cluster.projectID }}"
          # A secretKeyRef to a google cloud json service account
          serviceAccountSecretRef:
            name: external-dns-gcp-sa
            key: credentials.json
{{- end }}
{{- if eq .Values.cluster.provider "eks" }}
        route53:
          region: {{ .Values.cluster.region }}
{{- end }}
{{- end }}
{{- end }}
```
primero tenemos que ver 2 cosas la primera es que están utilizando un objecto "Issuer" esto quiere decir que están usando un [Custom Resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
o crd y también puedes ver que están utilizando un componente externo [cert-manager](https://cert-manager.io/) para lo siguiente tuve que leer un poco e investigar como es que funciona cert-manager mis fuentes fueron primero una lista de reproducción de Youtube que te explica como es que TLS funciona hasta hacer una implementación de cert-manager [kubucation youtube channel](https://www.youtube.com/playlist?list=PLShDm2AZYnK3cWZpOjV7nOpL7plH2Ztz0) y lo siguiente es ver como que funciona el [dns01 challenge](https://letsencrypt.org/docs/challenge-types/) podríamos probar con el http pero [cert-manager Digital Ocean](https://cert-manager.io/docs/configuration/acme/dns01/digitalocean/) tiene configuración para usar dns01 veamos si hacemos que funcione.

## Configuración para Digital Ocean
Según la documentación necesitamos un secret en ejemplo nos colocan uno que se llama `digitalocean-dns` me gusta el nombre con un key de `access-token`. 

>This provider uses a Kubernetes Secret resource to work. In the following example, the Secret will have to be named digitalocean-dns and have a sub-key access-token with the token in it.
```yaml
apiVersion: cert-manager.io/v1alpha2
kind: Issuer
metadata:
  name: example-issuer
spec:
  acme:
    ...
    solvers:
    - dns01:
        digitalocean:
          tokenSecretRef:
            name: digitalocean-dns
            key: access-token
```
El secret lo tenemos que crear en el namespace jx

`
error: upgrading helm chart '.': failed to run 'kubectl apply --recursive -f /tmp/helm-template-workdir-426612810/acme/output/namespaces/jx -l jenkins.io/chart-release=acme --namespace jx --wait --validate=false'
`

Ok entonces creemos el Secret al no tener vault para almacenarlos pues tenemos que crearlo de manera manual.
```yaml
apiVersion: v1
kind: Secret
metadata:
  name:  digitalocean-dns
stringData:
   access-token: ${access-token}
type: Opaque
```
ahora hay que modificar el archivo `cert-manager-staging-issuer` para colocar la configuración de Digital Ocean, quedaría de la siguiente manera. como pueden ver elimine las condiciones de gke y eks ya que no lo utilizo.
```yaml
{{- if .Values.certmanager.enabled }}
{{- if eq .Values.certmanager.production "false" }}
apiVersion: cert-manager.io/v1alpha2
kind: Issuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: "{{ .Values.certmanager.email }}"
    # Name of a secret used to store the ACME account private key
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - selector:
        dnsNames:
        - "*.{{ .Values.cluster.domain }}"
        - "{{ .Values.cluster.domain }}"
      # ACME DNS-01 provider configurations
      dns01:
        digitalocean:
          tokenSecretRef:
            name: digitalocean-dns
            key: access-token
{{- end }}
{{- end }}

```
veamos que pasa es tiempo de volver a ejecutar `jx boot --verbose` pues para mi la instalación se completo sin problema y las urls se cambiaron a HTTPS aun que no funcionan el Issuer ya que si verifico si el certificado esta listo para ser usado dice que no ` kubectl describe certificate tls-apps-beethub-com-mx-s`
```
Status:
  Conditions:
    Last Transition Time:  2020-03-08T20:19:04Z
    Message:               Waiting for CertificateRequest "tls-apps-beethub-com-mx-s-234585427" to complete
    Reason:                InProgress
    Status:                False
    Type:                  Ready
Events:                    <none>
```
lo siguiente fue ver los eventos `kubectl get events` en el cual encontré otro log:

`
2m52s       Warning   PresentError        challenge/tls-apps-beethub-com-mx-s-234585427-3522979291-3250367871 Error presenting challenge: POST https://api.digitalocean.com/v2/domains/beethub.com.mx/records: 404 The resource you were accessing could not be found.
`

revisando el API de digital ocean veo que es para crear un registro en el dominio de `beethub.com.mx` así que ahora toca revisar el pod del controller `kubectl logs cm-cert-manager-5f5c9cc976-6wrn4 -n cert-manager` aquí encontré el siguiente error.

`
E0308 23:00:23.165037       1 controller.go:131] cert-manager/controller/challenges "msg"="re-queuing item  due to error processing" "error"="POST https://api.digitalocean.com/v2/domains/beethub.com.mx/records: 404 The resource you were accessing could not be found." "key"="jx/tls-apps-beethub-com-mx-s-234585427-3522979291-3250367871" 
`

entonces creo que tengo que crear el domain en Digital ocean es decir no se crea solo entonces cree el domain en DigitalOcean pero eso no quiere decir que el challenge se vaya a resolver veamos si se agrega el record sin necesidad de iniciar un nuevo pipeline o si marca algun error.

al agregar el dominio a digital ocean se agrego el TXT record despues de unos minutos lo siguiente es esperar que el TXT record sea visible en la web.

`
E0308 23:24:13.814983       1 sync.go:184] cert-manager/controller/challenges "msg"="propagation check failed" "error"="DNS record for \"apps.beethub.com.mx\" not yet propagated" "dnsName"="apps.beethub.com.mx" "resource_kind"="Challenge" "resource_name"="tls-apps-beethub-com-mx-s-234585427-3522979291-3250367871" "resource_namespace"="jx" "type"="dns-01" 
`

Así que para esto apunte los dns del subdominio de apps a digital ocean y en el dominio agregue los registros **A** con la dirrecion Ip de el balanceador de carga.

Al hacer el lookup ya veo el registro TXT, y el dns resuelve desde mi computadora aun que en el log solo veo

`
E0309 00:34:09.612552       1 sync.go:184] cert-manager/controller/challenges "msg"="propagation check failed" "error"="DNS record for \"apps.beethub.com.mx\" not yet propagated" "dnsName"="apps.beethub.com.mx" "resource_kind"="Challenge" "resource_name"="tls-apps-beethub-com-mx-s-234585427-3522979291-3250367871" "resource_namespace"="jx" "type"="dns-01" 
`

Seguí buscando información pero al rededor de 1 hora después de que agregue el DNS y era visible el record en el DNS se quito el error y ya se puede ver de manera correcta el Issuer `kubectl describe Issuer` 
```
Status:
  Acme:
    Last Registered Email:  contacto.beet@gmail.com
    Uri:                    https://acme-staging-v02.api.letsencrypt.org/acme/acct/12717811
  Conditions:
    Last Transition Time:  2020-03-08T22:39:13Z
    Message:               The ACME account was registered with the ACME server
    Reason:                ACMEAccountRegistered
    Status:                True
    Type:                  Ready
Events:                    <none>
```
Momento de pasar a al servidor de producción de Let's Encrypt para esto solo vamos a cambiar la propiedad `ingress.production` a true y con eso deberia ser suficiente para ya obtener un certificado valido, no olvidemos que tenemos que modificar el archivo `cert-manager-prod-issuer.yaml` ya que tenemos que colocar el mismo secret.

Como comentario adicional tendría que comentar que cambie el `Kind` a `ClusterIssuer` ya que los Issuer es por Namespace es decir para cada namespace que tengamos tendríamos que crear un Issuer me pareció mejor idea crear un ClusterIssuer y solo generar un certificado por namespace.
