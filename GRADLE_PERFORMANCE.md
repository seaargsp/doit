# Gradle Build Performance Tips

## What we've configured:

### 1. Memory Optimizations
- Increased heap size to 4GB for both local and Android gradle.properties
- Added parallel GC for better memory management
- Set MaxMetaspaceSize to avoid memory issues

### 2. Build Caching
- Enabled global Gradle build cache (org.gradle.caching=true)
- Enabled Android build cache (android.enableBuildCache=true)
- Added configuration cache for faster consecutive builds

### 3. Parallel Processing
- Enabled parallel Gradle execution
- Enabled incremental compilation for Kotlin
- Enabled incremental annotation processing

### 4. File System Optimizations
- Enabled VFS watching for faster incremental builds
- Enabled incremental desugaring for Android

### 5. Additional Android Optimizations
- Enabled R8/ProGuard for release builds
- Non-transitive R classes for smaller APKs
- Resource optimizations enabled

## Additional Commands for Even Faster Builds:

### For development builds (faster compilation):
```bash
# Build only for your device architecture
./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a

# Skip lint checks during development
./gradlew assembleDebug -x lint

# Use build cache and parallel processing
./gradlew assembleDebug --build-cache --parallel
```

### For release builds (full optimization):
```bash
# Clean build with all optimizations
./gradlew clean assembleRelease --build-cache --parallel
```

### First-time setup (one time only):
```bash
# Clear any corrupted caches
./gradlew clean cleanBuildCache

# Initialize build cache
./gradlew tasks --build-cache
```

## Expected Performance Improvements:
- First build: May be slightly slower due to cache initialization
- Subsequent builds: 30-70% faster depending on changes
- Clean builds: 20-40% faster due to parallel processing and memory optimizations
- Incremental builds: Significantly faster with VFS watching and configuration cache

## Troubleshooting:
If you encounter issues with the configuration cache, you can temporarily disable it by setting:
`org.gradle.configuration-cache=false` in gradle.properties