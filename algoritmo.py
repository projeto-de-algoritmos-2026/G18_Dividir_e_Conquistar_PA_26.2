import math

INF = math.inf

def dist(p, q):
    return math.hypot(p[0] - q[0], p[1] - q[1])

class _Ctx:
    def __init__(self, record):
        self.record = record
        self.events = []
        self.comps = 0
        self.max_neighbors = 0

    def d(self, p, q):
        self.comps += 1
        return dist(p, q)

    def emit(self, type_, **data):
        data["type"] = type_
        data["comps"] = self.comps
        self.events.append(data)

def brute_force(points):
    n = len(points)
    if n < 2:
        raise ValueError("São necessários pelo menos 2 pontos.")
    best_d, best_pair, comps = INF, None, 0
    for i in range(n - 1):
        for j in range(i + 1, n):
            comps += 1
            d = dist(points[i], points[j])
            if d < best_d:
                best_d, best_pair = d, (i, j)
    return {"distance": best_d, "pair": list(best_pair), "comparisons": comps}

def _merge_by_y(A, B):
    i = j = 0
    out = []
    while i < len(A) and j < len(B):
        if A[i][1] <= B[j][1]:
            out.append(A[i])
            i += 1
        else:
            out.append(B[j])
            j += 1
    out.extend(A[i:])
    out.extend(B[j:])
    return out

def _brute_small(P, depth, ctx):
    best = None
    for i in range(len(P)):
        for j in range(i + 1, len(P)):
            d = ctx.d(P[i], P[j])
            if ctx.record:
                ctx.emit("compare", depth=depth, phase="base", a=P[i][2], b=P[j][2],
                         d=d, delta=best[2] if best else None)
            if best is None or d < best[2]:
                best = (P[i][2], P[j][2], d)
                if ctx.record:
                    ctx.emit("update_best", depth=depth, phase="base",
                             a=best[0], b=best[1], d=d)
    return best

def _solve(P, depth, ctx):
    n = len(P)
    if n <= 3:
        if ctx.record:
            ctx.emit("base_case", depth=depth, ids=[p[2] for p in P])
        best = _brute_small(P, depth, ctx)
        return best, sorted(P, key=lambda p: (p[1], p[0], p[2]))

    mid = n // 2
    line_x = (P[mid - 1][0] + P[mid][0]) / 2
    left, right = P[:mid], P[mid:]
    if ctx.record:
        ctx.emit("divide", depth=depth, line_x=line_x,
                 left=[p[2] for p in left], right=[p[2] for p in right])

    best_l, A = _solve(left, depth + 1, ctx)
    best_r, B = _solve(right, depth + 1, ctx)
    best = best_l if best_l[2] <= best_r[2] else best_r
    delta = best[2]
    if ctx.record:
        ctx.emit("combine", depth=depth, line_x=line_x, delta_left=best_l[2],
                 delta_right=best_r[2], delta=delta, best=list(best))

    S = _merge_by_y(A, B)
    strip = [p for p in S if abs(p[0] - line_x) < delta]
    if ctx.record:
        ctx.emit("strip", depth=depth, line_x=line_x, delta=delta,
                 ids=[p[2] for p in strip])

    for i in range(len(strip)):
        count = 0
        j = i + 1
        while j < len(strip) and strip[j][1] - strip[i][1] < best[2]:
            d = ctx.d(strip[i], strip[j])
            count += 1
            if ctx.record:
                ctx.emit("compare", depth=depth, phase="strip", a=strip[i][2],
                         b=strip[j][2], d=d, delta=best[2])
            if d < best[2]:
                best = (strip[i][2], strip[j][2], d)
                if ctx.record:
                    ctx.emit("update_best", depth=depth, phase="strip",
                             a=best[0], b=best[1], d=d)
            j += 1
        ctx.max_neighbors = max(ctx.max_neighbors, count)

    return best, S

def closest_pair(points, record=True):
    n = len(points)
    if n < 2:
        raise ValueError("São necessários pelo menos 2 pontos.")
    P = sorted(((float(x), float(y), i) for i, (x, y) in enumerate(points)),
               key=lambda p: (p[0], p[1], p[2]))
    ctx = _Ctx(record)
    if record:
        ctx.emit("start", n=n)
    best, _ = _solve(P, 0, ctx)
    a, b, d = best
    pair = sorted((a, b))
    if record:
        ctx.emit("done", a=pair[0], b=pair[1], d=d)
    return {"distance": d, "pair": pair, "comparisons": ctx.comps,
            "max_neighbors": ctx.max_neighbors, "events": ctx.events}