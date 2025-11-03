if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting server...")
    uvicorn.run("main_fixed:app", host="0.0.0.0", port=PORT, reload=True)
