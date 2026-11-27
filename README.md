# AthenaUI Front-end
AthenaUI front-end application is the single page web application built via React UI library. 
It is shipped inside the [Athena API](https://github.com/OHDSI/Athena) Jar archive, which compiles
this application from source at build time.

# Build Web Applications

### Get sources

Checkout [AthenaUI repository](https://github.com/OHDSI/AthenaUI.git): 
```
git clone https://github.com/OHDSI/AthenaUI.git 
```

### Install npm packages

After getting the sources please execute following commands: 

```
cd AthenaUI
npm install
```

### Build

In order to assemble AthenaUI web application please run:
```
npm run build
```
The compiled application is written to `dist/`.

### Package into the Athena Jar

The Jar is built from the [Athena](https://github.com/OHDSI/Athena) repository, which checks this
application out as the `ui` submodule and builds it from source. There is no separate artifact to
publish from here:
```
cd Athena
mvn clean package
```
To package a different checkout of this repository instead of the pinned submodule:
```
mvn clean package -Dathena.ui.dir=/path/to/AthenaUI
```


# Development guide

### Run in development mode

In order to start web app please start [Athena API](https://github.com/OHDSI/Athena) backend and execute following command:
```
npm run start
```
Webpack dev server should start at [localhost:3000](http://localhost:3000)
